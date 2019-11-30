;$$fileupload_sound = (function(){

  var LIB  = function(){};
  var SET  = function(){};
  var GET  = function(){};
  var VIEW = function(){};
  var POST = function(){};
  var ACTION = function(){};


  // 起動scriptタグを選択
  LIB.prototype.currentScriptTag = (function(){
    var scripts = document.getElementsByTagName("script");
    return this.currentScriptTag = scripts[scripts.length-1].src;
  })();

  // [共通関数] イベントセット
	LIB.prototype.event = function(target, mode, func , option , wait){
    option = (option) ? option : false;
    wait = (wait) ? wait : 0;
		if (target.addEventListener){target.addEventListener(mode, func, option)}
		else{target.attachEvent('on' + mode, function(){func.call(target , window.event)})}
	};

  // [共通関数] URL情報分解
	LIB.prototype.urlinfo = function(uri){
    uri = (uri) ? uri : location.href;
    var data={};
    var urls_hash  = uri.split("#");
    var urls_query = urls_hash[0].split("?");
		var sp   = urls_query[0].split("/");
		var data = {
      uri      : uri
		,	url      : sp.join("/")
    , dir      : sp.slice(0 , sp.length-1).join("/") +"/"
    , file     : sp.pop()
		,	domain   : sp[2]
    , protocol : sp[0].replace(":","")
    , hash     : (urls_hash[1]) ? urls_hash[1] : ""
		,	query    : (urls_query[1])?(function(urls_query){
				var data = {};
				var sp   = urls_query.split("#")[0].split("&");
				for(var i=0;i<sp .length;i++){
					var kv = sp[i].split("=");
					if(!kv[0]){continue}
					data[kv[0]]=kv[1];
				}
				return data;
			})(urls_query[1]):[]
		};
		return data;
  };

  // [共通関数] DOMの上位検索
  LIB.prototype.upperSelector = function(elm , selectors) {
    selectors = (typeof selectors === "object") ? selectors : [selectors];
    if(!elm || !selectors){return;}
    var flg = null;
    for(var i=0; i<selectors.length; i++){
      for (var cur=elm; cur; cur=cur.parentElement) {
        if (cur.matches(selectors[i])) {
          flg = true;
          break;
        }
      }
      if(flg){
        break;
      }
    }
    return cur;
  }

  // [共通関数] ブラウザのFileAPIが利用できるかどうかチェックする
  LIB.prototype.checkFileAPI = function(){
    // FileApi確認
		if( window.File
    && window.FileReader
    && window.FileList
    && window.Blob) {
      return true;
    }
    else{
      return false;
    }
  };

  LIB.prototype.setFormatTime = function(time , mode){
		var time2 = parseInt(time * 10 , 10) /10;
		var m = parseInt(time2 / 60 , 10);
		m = (m < 10) ? "0" + m.toFixed() : m.toFixed();
		var s = parseInt(time2 % 60 , 10);
		s = (s < 10) ? "0" + s.toFixed() : s.toFixed();
		var ms = parseInt((time % 1) * 100 , 10);
    ms = (ms < 10) ? "0" + ms.toFixed() : ms.toFixed();
    if(mode === "ms"){
      return m +":"+ s;
    }
    else{
      return m +":"+ s +":"+ ms;
    }
  };

  LIB.prototype.convertSize_b2k = function(bite){
    var main = this;

    bite = (bite) ? Number(bite) : 0;
    var kiro = String((Math.round(bite / 1000 * 10)) / 10);
    return kiro + " KB";
  }
  LIB.prototype.convertSize_b2m = function(bite){
    var main = this;

    bite = (bite) ? Number(bite) : 0;
    var kiro = String((Math.round(bite / 1000 / 1000 * 10)) / 10);
    return kiro + " MB";
  }

  // [共通関数] JS読み込み時の実行タイミング処理（body読み込み後にJS実行する場合に使用）
	LIB.prototype.construct = function(){
    var lib = new LIB();

    switch(document.readyState){
      case "complete"    : new MAIN;break;
      case "interactive" : lib.event(window , "DOMContentLoaded" , function(){new MAIN});break;
      default            : lib.event(window , "load" , function(){new MAIN});break;
		}
  };

  var __options = {
    id            : null, // インスタンス（送信用とする）識別子 : システム利用用（設定不可）
    count         : null, // 送信する画像の総合枚数（送信ボタンを押すと確定） : システム利用用（設定不可）
    cacheTime     : null, // システム利用用（設定不可）
    currentPath   : null, // システム利用用（設定不可）

    btn_selector  : "#fileupload", // クリックするボタンのselectors（複数対応）

    // アップロード前のプレビュー用
    css_path      : null, // 表示系cssの任意指定（デフォルト(null)は起動スクリプトと同一階層）
    file_multi    : true, // 複数ファイルアップロード対応 [ true : 複数  , false : 1つのみ]
    contentTypes  : ["audio/mpeg"],
    img_rotate_button  : null, // 画像編集の回転機能アイコン（デフォルト(null)は起動スクリプトと同一階層）
    img_delete_button  : null, // 画像編集の削除機能アイコン（デフォルト(null)は起動スクリプトと同一階層）
    img_comment_button : null, // 画像編集のコメント機能アイコン（デフォルト(null)は起動スクリプトと同一階層）
    img_info_button    : null,

    // 機能（アイコン）表示フラグ
    flg_icon_comment : true,

    querys        : {},   // input type="hidden"の任意値のセット(cgiに送信する際の各種データ)
    postStringFormat : "",  // post-string-format ["":HTML-ENTITIES , encode:encodeURIComponent(php->urldecode())]

    // comment
    comment : {
      placeholder : "Comment...",
    },
    info_area_view : true,

    // dom構造(className)
    dom:{
      base : "fileUpload-base-sound",
        ul : "",
          li : "sound",
            num : "num",
              info_title : "info-title",
              info_title_input : "info-title-input",
              delete_button : "delete",
            audio_area : "audio-area",
              audio     : "audio",
                source  : "source",
            info    : "info",
              info_time  : "info-time",
              info_size  : "info-size",
              info_type  : "info-type",
            idv3    : "idv3-area",

            control : "control",
              comment_button : "comment-icon",
              info_button : "info-icon",
            comment_area : "comment-area",
              comment_title : "comment-title",
              comment_form  : "comment-form",
            
          li_submit : "submit",
            btn_submit : "button_submit",
            btn_cancel : "button_cancel",
            uploading  : "uploading",
            uploading_dot : "dot"
    },

    file_select   : function(res){},  // ファイル選択直後の任意イベント処理
    post_success  : function(res){},  // 1ファイルファイル送信完了後の任意イベント処理
    post_finish   : function(res){},  // すべてのファイル送信完了後の任意イベント処理
    post_error    : function(res){},  // ファイル送信エラーの時の任意イベント処理

    sound_template : null
  };

  // ----------

  // インスタンスベースモジュール（初期設定処理）
  var MAIN = function(options){
    var main = this;
    var lib  = new LIB();
    var set  = new SET();

    main.options = set.replaceOptions(options);

    main.options.cacheTime = (+new Date());
    if(!main.options.currentPath && lib.currentScriptTag){
      var pathinfo = lib.urlinfo(lib.currentScriptTag);
      main.options.currentPath = pathinfo.dir;
    }

    // set-css
    set.setCss();
    set.setTemp_sound(main);
    
    set.setTypeFile(main);

		// upload-button
    set.setButton(main);
    
  };

  

  // [初期設定] インスタンス引数を基本設定(options)と入れ替える
  SET.prototype.replaceOptions = function(options){
    var res = {};
    for(var i in __options){
      res[i] = __options[i];
    }
    for(var i in options){
      res[i] = options[i];
    }
    res.id = Math.floor((+new Date)/1000);
    return res;
  };

  // [初期設定] 基本CSSセット
  SET.prototype.setCss = function(){
    var lib  = new LIB();

    var head = document.getElementsByTagName("head");
    var base = (head) ? head[0] : document.body;
    var current_pathinfo = lib.urlinfo(lib.currentScriptTag);
    var css  = document.createElement("link");
    css.rel  = "stylesheet";
    var target_css = current_pathinfo.dir + current_pathinfo.file.replace(".js",".css");
    var query = [];
    for(var i in current_pathinfo.query){
      query.push(i);
    }
    css.href = target_css +"?"+ query.join("");
    base.appendChild(css);
  };

  // [初期設定] テンプレートhtmlをセット
  SET.prototype.setTemp_sound = function(main){
    var lib  = new LIB();

    var current_pathinfo = lib.urlinfo(lib.currentScriptTag);
    var target_html = current_pathinfo.dir + current_pathinfo.file.replace(".js",".html");
    new $$ajax({
      url : target_html,
    method : "get",
    query : {
      exit : true
    },
    onSuccess : (function(main,res){
      main.options.sound_template = res;
    }).bind(this,main)
    });
  };

  GET.prototype.getBase = function(main){
    var lists = document.getElementsByClassName(main.options.dom.base);
    if(lists.length){
      return lists[0];
    }
    else{
      return null;
    }
  };

  // 処理用iframe内のform内のtype=fileを取得
  GET.prototype.getForm_typeFile = function(main){
    return document.querySelector("input[name='fileupload_"+ main.options.cacheTime +"']");
  };

  // 編集画面の画像一覧リストの取得
  GET.prototype.getEditLists = function(main){
    return document.querySelectorAll("."+main.options.dom.base+" ."+main.options.dom.li);
  };

  SET.prototype.setTypeFile = function(main){
    var lib  = new LIB();
    var view = new VIEW();

    var inp      = document.createElement("input");
		inp.type     = "file";
    inp.name     = "fileupload_" + main.options.cacheTime;
    inp.multiple = (main.options.file_multi) ? "multiple" : "";
    inp.style.setProperty("display","none","");
    inp.accept   = main.options.contentTypes.join(",");

    lib.event(inp , "change" , (function(main,e){
      if(typeof main.options.file_select === "function" && lib.checkFileAPI()){
        var input = e.currentTarget;
        view.viewEdit(main , input);
        main.options.file_select(e , main.options);
      }
    }).bind(this,main));
    document.body.appendChild(inp);

  };
  
  // [初期設定] データ読み込みボタンclickイベント処理
  SET.prototype.setButton = function(main){
    var lib = new LIB();

    var btns = document.querySelectorAll(main.options.btn_selector);
    for(var i=0; i<btns.length; i++){
      lib.event(btns[i] , "click" , (function(main){new SET().clickFileButton(main)}).bind(this,main));
    }
  };

  // データ取得ボタンクリック時の処理
  SET.prototype.clickFileButton = function(main){
    var get  = new GET();

    var typeFile = get.getForm_typeFile(main);
    typeFile.click();
  };


  // [画像編集] 送信前の画像編集操作処理
  VIEW.prototype.viewEdit = function(main , targetInputForm){
    var view = new VIEW();

    view.viewBase(main);
    view.viewLists(main , targetInputForm);
    // システムデータ保持
    main.options.id = Math.floor((+new Date())/1000);
    main.options.count = targetInputForm.files.length;
  };


  // [画像編集] 編集画面表示（複数画像対応）
  VIEW.prototype.viewLists = function(main , filesElement){
    if(!filesElement){return;}

    var set = new SET();

    var files = filesElement.files;
    if(!files || !files.length){return;}

    var bgs = document.getElementsByClassName(main.options.dom.base);
    if(!bgs || !bgs.length){return;}
    var bg = bgs[0];

    var ul = document.createElement("ul");
    bg.appendChild(ul);

    for(var i=0; i<files.length; i++){
      var li = set.setList(main , files[i] , i);
      ul.appendChild(li);
    }

    // submit,cancel-button
    var file_count = files.length;
    var li = set.setControlButtons(main , file_count);
    ul.appendChild(li);
  };


  // プレビュー表示の写真表示箇所のエレメントセット
  SET.prototype.setList = function(main , fl,i){
    var lib  = new LIB();
    
    var parser = new DOMParser();
    var doc = parser.parseFromString(main.options.sound_template, "text/html");
    var li = doc.querySelector("."+main.options.dom.li);
    li.setAttribute("data-num" , i);

    var audio  = li.querySelector("."+main.options.dom.audio);
    var source = audio.querySelector("."+main.options.dom.source);

    var path = URL.createObjectURL(fl);
    source.src = path;

    audio.setAttribute("data-num"    , i);
    audio.setAttribute("data-type"   , fl.type);
    audio.setAttribute("data-size"   , fl.size);

    var info_area = li.querySelector("."+main.options.dom.info);
    if(info_area && main.options.info_area_view){
      info_area.setAttribute("data-view" , main.options.info_area_view);
    }

    var info_time = li.querySelector("."+main.options.dom.info_time);

    if(info_time){
      lib.event(audio , "loadedmetadata" , (function(info_time,e){
        var audio = e.target;
        var tm = audio.duration;
        info_time.textContent = new LIB().setFormatTime(tm);
        audio.setAttribute("data-time" , audio.duration);
      }).bind(this , info_time));
    }
    
    var info_title = li.querySelector("."+main.options.dom.info_title);
    if(info_title){
      info_title.textContent = fl.name;
    }
    var info_title_input = li.querySelector("."+main.options.dom.info_title_input);
    if(info_title_input){
      var title = fl.name
      title = title.replace(/\.mp3/,"");
      info_title_input.value = title;
    }


    var info_type = li.querySelector("."+main.options.dom.info_type);
    if(info_type){
      info_type.textContent = fl.type;
    }

    var info_size = li.querySelector("."+main.options.dom.info_size);
    var size = (fl.size.length <= 6) ? lib.convertSize_b2k(sifl.sizeze) : lib.convertSize_b2m(fl.size);
    if(info_size){
      info_size.textContent = size;
    }
    

    // var control = li.querySelector("."+this.options.dom.control);
    // control.setAttribute("data-num" , i);

    var delElement = li.querySelector("."+main.options.dom.delete_button);
    delElement.src = (main.options.img_delete_button !== null) ? main.options.img_delete_button : main.options.currentPath + "img/delete.svg";
    lib.event(delElement , "click" , (function(main,e){new ACTION().clickDeleteButton(main,e)}).bind(this,main));

    var commentButton = li.querySelector("."+main.options.dom.comment_button);
    commentButton.src = (main.options.img_comment_button) ? main.options.img_comment_button : main.options.currentPath + "img/comment.svg";
    commentButton.setAttribute("data-view" , (main.options.flg_icon_comment === true) ? 1 : 0);
    lib.event(commentButton , "click" , (function(main,e){new ACTION().clickCommentButton(main , e)}).bind(this,main));

    var infoButton = li.querySelector("."+main.options.dom.info_button);
    infoButton.src = (main.options.img_info_button) ? main.options.img_info_button : main.options.currentPath + "img/info.svg";
    infoButton.setAttribute("data-view" , (main.options.flg_icon_comment === true) ? 1 : 0);
    lib.event(infoButton , "click" , (function(main , e){new ACTION().clickInfoButton(main , e)}).bind(this , main));

    var commentForm = li.querySelector("."+main.options.dom.comment_form);
    if(commentForm){
      commentForm.placeholder = (main.options.comment.placeholder) ? main.options.comment.placeholder : "";
    }

    // IDv3
    var reader = new FileReader();
    reader.readAsArrayBuffer(fl);
    reader.onload = (function(main , li , filename , type , size , e){
      var res = new GET().getMp3ID3Tag(e.target.result , e.target.buffer);
      // console.log(res);
      var tag_area = li.querySelector("."+main.options.dom.idv3);
      var endtime = li.querySelector("."+main.options.dom.audio).getAttribute("data-time");
      if(tag_area){
        var htmls = [];
        htmls.push("<b>[ ファイル情報 ]</b>");
        htmls.push("  File : "    + filename);
        htmls.push("  Time : "    + new LIB().setFormatTime(endtime , "ms"));
        htmls.push("  Type : "    + type);
        htmls.push("  Size : "    + size);

        if(res && res.length){
          htmls.push("<b>[ ID3Tag情報 ]</b>");
          htmls.push("  Title : "   + res[1]);
          htmls.push("  Artist : "  + res[2]);
          htmls.push("  Album : "   + res[3]);
          htmls.push("  Date : "    + res[4]);
          htmls.push("  Comment : " + res[5]);
        }

        // id3tag-data-set
        tag_area.setAttribute("data-title"   , (res && (res[1]) ? res[1] : ""));
        tag_area.setAttribute("data-artist"  , (res && (res[1]) ? res[2] : ""));
        tag_area.setAttribute("data-album"   , (res && (res[1]) ? res[3] : ""));
        tag_area.setAttribute("data-date"    , (res && (res[1]) ? res[4] : ""));
        tag_area.setAttribute("data-comment" , (res && (res[1]) ? res[5] : ""));
        
        tag_area.innerHTML = htmls.join("\n");
      }
    }).bind(this , main , li , fl.name , fl.type , size);

    return li;
  };

//   // mp3のID3タグ情報の取得
//   // [0:TAG 1:title 2:artist 3:album 4:date 5:comment 6:genre-no]
//   GET.prototype.getMp3IDTag = function(result , buffer){
//     if(!result){return null;}
//     if(typeof window.Encoding === "undefined"){return null;}
//     var main = this;

//     var id3v1 = (new Uint8Array(result)).slice(-128);
//     var judge = id3v1[0] + id3v1[1] + id3v1[2];
//     var arr = [];
//     if (judge == 220) {
//       var num = 0;
//       for (var i=0; i<=127; i++) {
//         if(i == 3 || i == 33 || i == 63 || i == 93 || i == 97 || i == 127){num++}
//         if(id3v1[i] == 0){continue}
//         arr[num] = (typeof arr[num] !== "undefined") ? arr[num] : "";
//         arr[num] += String.fromCharCode(id3v1[i]);
//       }
//       for(var i=0; i<arr.length; i++){
//         var str = Encoding.convert(arr[i] , "UNICODE" , "SJIS");
//         // var str = arr[i];
//         str = str.replace(/\u000f/g , "");
//         str = str.replace(/^ +/g , "");
//         str = str.replace(/ +$/g , "");
//         arr[i] = str;
//       }
//     }
// // console.log(new Uint8Array(buffer));
// // console.log(id3v1);
// // console.log(id3v1[0] +"+"+ id3v1[1] +"+"+ id3v1[2]+":"+id3v1.length);
// // console.log(judge);
// // console.log((new Uint8Array(result)).slice(128));
// // console.log(id3v1.length);

//     return arr;
//   };

  GET.prototype.getMp3ID3Tag = function(result){
    if(!result){return null;}
    if(typeof window.Encoding === "undefined"){return null;}

    var id3v1 = (new Uint8Array(result)).slice(-128);
    var judge = id3v1[0] + id3v1[1] + id3v1[2];
    var arr = [];
    if (judge == 220) {
      var num = 0;
      for (var i=0; i<=127; i++) {
        if(i == 3 || i == 33 || i == 63 || i == 93 || i == 97 || i == 127){num++}
        if(id3v1[i] == 0){continue}
        arr[num] = (typeof arr[num] !== "undefined") ? arr[num] : "";
        arr[num] += String.fromCharCode(id3v1[i]);
      }
      for(var i=0; i<arr.length; i++){
        var str = Encoding.convert(arr[i] , "UNICODE" , "SJIS");
        str = str.replace(/\u000f/g , "");
        str = str.replace(/^ +/g , "");
        str = str.replace(/ +$/g , "");
        arr[i] = str;
      }
    }
    return arr;
  };



  // submit,cancel-button
  SET.prototype.setControlButtons = function(main , file_count){
    var lib  = new LIB();

    var li = document.createElement("li");
    li.className = main.options.dom.li_submit;

    var sendButton = document.createElement("button");
    if(file_count > 1){
      sendButton.innerHTML = "すべて送信";
    }
    else{
      sendButton.innerHTML = "送信";
    }
    
    lib.event(sendButton , "click" , (function(main,e){new ACTION().clickSendButton(main,e)}).bind(this,main));
    li.appendChild(sendButton);

    var cancelButton = document.createElement("button");
    cancelButton.innerHTML = "キャンセル";
    lib.event(cancelButton , "click" , (function(main){new ACTION().clickCancel(main)}).bind(this,main));
    li.appendChild(cancelButton);

    var uploading = document.createElement("div");
    uploading.className = main.options.dom.uploading;
    li.appendChild(uploading);
    for(var i=0; i<12;i++){
      var dot = document.createElement("div");
      dot.className = main.options.dom.uploading_dot;
      uploading.appendChild(dot);
    }

    return li;
  };

  


  // [画像編集] BG表示
  VIEW.prototype.viewBase = function(main){
    var bg = document.createElement("div");
    bg.className = main.options.dom.base;
    document.body.appendChild(bg);
  };


  //
  ACTION.prototype.clickDeleteButton = function(main , e){
    if(!confirm("アップロードリストから写真を破棄しますか？※直接撮影された写真は保存されません。")){return;}
    var lib    = new LIB();
    var get    = new GET();
    var action = new ACTION();

    var target = e.currentTarget;
    var li = lib.upperSelector(target , ["."+main.options.dom.li]);
    if(!li){return;}
    var num = li.getAttribute("data-num");
    if(num === null){return;}

    var targetListBase = document.querySelector("."+main.options.dom.base+" ul li."+main.options.dom.li+"[data-num='"+num+"']");
    if(!targetListBase){return;}

    targetListBase.parentNode.removeChild(targetListBase);

    // ラスト１つを削除した場合は、キャンセル扱い
    var lists = get.getEditLists(main);
    if(!lists || !lists.length){
      action.clickCancel(main);
    }

    // キャッシュデータを更新
    main.options.count = lists.length;
  }


  // 
  ACTION.prototype.clickCancel = function(main){
    var get  = new GET();

    var base = get.getBase(main);
    if(base){
      base.parentNode.removeChild(base);
    }

    var input = get.getForm_typeFile(main);
    input.value = "";
  };



  ACTION.prototype.clickSendButton = function(main , e){
    var get  = new GET();
    var post = new POST();

    var files = get.getForm_typeFile(main).files;
    var lists = get.getEditLists(main);
    for(var i=0; i<lists.length; i++){
      var num = lists[i].getAttribute("data-num");
      post.postFiles_cache.push(files[num]);
    }

    // submitボタンを押せないようにする
    post.disable_submitButtin(main , e.target);

    // uploading フラグ設置
    var submitArea = document.querySelector("."+main.options.dom.base+" li."+main.options.li_submit);
    if(submitArea){
      submitArea.setAttribute("data-uploading","1");
    }

    if(post.postFiles_cache.length > 0){
      post.postFile(main , lists[0]);
    }
  };

  ACTION.prototype.clickCommentButton = function(main , e){
    var lib  = new LIB();

    var button = e.currentTarget;
    var li = lib.upperSelector(button , ["."+main.options.dom.li]);
    if(!li){return}
    var comment_area = li.querySelector("."+main.options.dom.comment_area);

    var comment_form = comment_area.querySelector("."+main.options.dom.comment_form);

    if(comment_area.getAttribute("data-view") === "0" || comment_form.value !== ""){
      comment_area.setAttribute("data-view","1");
    }
    else{
      comment_area.setAttribute("data-view","0");
    }
  }

  ACTION.prototype.clickInfoButton = function(main , e){
    var lib  = new LIB();

    var button = e.currentTarget;
    var li = lib.upperSelector(button , ["."+main.options.dom.li]);
    if(!li){return}
    var idv3 = li.querySelector("."+main.options.dom.idv3);
    if(!idv3){return}
    if(idv3.getAttribute("data-view") !== "1"){
      idv3.setAttribute("data-view","1");
    }
    else{
      idv3.setAttribute("data-view","0");
    }
  };

  POST.prototype.disable_submitButtin = function(main , button){
    button.textContent = "...";
    button.disabled = true;
  };

  POST.prototype.postFiles_cache = [];
  POST.prototype.postFile = function(main , viewListElement){
    if(!window.FormData){
      console.log("データ送信機能がブラウザに対応していません。");
      return;
    }

    if(!window.XMLHttpRequest){
      console.log("AJAX機能がブラウザに対応していません。");
      return;
    }
    var main   = main;
    var action = new ACTION();
    var post   = this;
    var get    = new GET();

    // 全て送信完了したら編集画面を閉じる
    if(!post.postFiles_cache.length){
      action.clickCancel(main);
      return;
    }

    // areaに送信中フラグをセット
    var area = viewListElement.querySelector("."+main.options.dom.audio_area);
    if(area){
      area.setAttribute("data-uploading" , "1");
    }

    var fd   = new FormData();
    if(main.options.querys){
      for(var i in main.options.querys){
        fd.append(i , main.options.querys[i]);
      }
    }
    var name_input = viewListElement.querySelector("."+ main.options.dom.info_title_input);
    if(name_input){
      fd.append("info[name]"   , post.set_postStringFormat(main , name_input.value));
    }

    fd.append("id"           , main.options.id);
    fd.append("num"          , (main.options.count - post.postFiles_cache.length));
    fd.append("audioFile"    , post.postFiles_cache[0]);
    
    fd.append("info[file]"   , post.set_postStringFormat(main , post.postFiles_cache[0].name));
    fd.append("info[modi]"   , post.set_postStringFormat(main , post.postFiles_cache[0].lastModified));
    fd.append("info[date]"   , post.set_postStringFormat(main , Date.parse(post.postFiles_cache[0].lastModifiedDate)));
    
    var audio = viewListElement.querySelector("."+ main.options.dom.audio);
    fd.append("info[type]"   , post.set_postStringFormat(main , audio.getAttribute("data-type")));
    fd.append("info[size]"   , post.set_postStringFormat(main , audio.getAttribute("data-size")));
    fd.append("info[time]"   , post.set_postStringFormat(main , audio.getAttribute("data-time")));

    // id3tag
    var idv3 = viewListElement.querySelector("."+ main.options.dom.idv3);
    fd.append("id3tag[title]"   , post.set_postStringFormat(main , idv3.getAttribute("data-title")));
    fd.append("id3tag[artist]"  , post.set_postStringFormat(main , idv3.getAttribute("data-artist")));
    fd.append("id3tag[album]"   , post.set_postStringFormat(main , idv3.getAttribute("data-album")));
    fd.append("id3tag[date]"    , post.set_postStringFormat(main , idv3.getAttribute("data-date")));
    fd.append("id3tag[comment]" , post.set_postStringFormat(main , idv3.getAttribute("data-comment")));

    // comment
    var comment = viewListElement.querySelector("."+ main.options.dom.comment_form);
    if(comment){
      fd.append("info[comment]" , post.set_postStringFormat(main , comment.value));
    }

    var lists = get.getEditLists(main);
    if(!lists.length){return;}

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = (function(main , xhr,e){
      switch(xhr.readyState){
        case 0:
          // 未初期化状態.
          // console.log( 'uninitialized!' );
          break;
        case 1: // データ送信中.
          // console.log( 'loading...' );
          break;
        case 2: // 応答待ち.
          // console.log( 'loaded.' );
          break;
        case 3: // データ受信中.
          // console.log( 'interactive... '+xhr.responseText.length+' bytes.' );
          break;
        case 4: // データ受信完了.
          switch(xhr.status){
            case 200 :
              var finish_flg = post.post_success(main);

              // ユーザー処理
              if(main.options.post_success){
                main.options.post_success(xhr.responseText , main.options);
              }

              // 複数ファイル完了処理
              if(finish_flg === true){
                main.options.post_finish(xhr.responseText , main.options);
              }

              break;
            case 404 :
              console.log("Error (404) : Not found. " + res);
              
              if(main.options.post_error){
                main.options.post_error(xhr.responseText , main.options)
              }
              break;
            default :
              console.log("Error");
              break;
          }
          break;
      }
    }).bind(this,main,xhr);
    var url = (main.options.url) ? main.options.url : location.href;
    xhr.open('POST', url);
    xhr.send(fd);

  };

  POST.prototype.set_postStringFormat = function(main , str){
    if(typeof str !== "string"){return str;}
    switch(main.options.postStringFormat){
      case "encode":
        return encodeURIComponent(str);

      default:
        return str;
    }
  };

  POST.prototype.post_success = function(main){
    var action = new ACTION();
    var get    = new GET();

    // メモリしてあるファイル一覧から送信済みを削除
    if(this.postFiles_cache.length){
      this.postFiles_cache.shift();
    }

    // 表示一覧から送信済みを削除
    var lists = get.getEditLists(main);
    if(lists.length){
      lists[0].parentNode.removeChild(lists[0]);
    }

    // 送信後の削除処理をした直後のエレメント一覧の取得
    var lists = get.getEditLists(main);

    // 次のファイルが存在
    if(lists.length){
      setTimeout((function(lists,e){this.postFile(lists)}).bind(this,lists[0]) , 100);
      return false;
    }

    // 最終完了
    else{
      // 表示を閉じる
      action.clickCancel(main);
      return true;
    }
  };
  
  return MAIN;

})();
