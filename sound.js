;$$fileupload_sound = (function(){

  // 起動scriptタグを選択
  var __currentScriptTag = (function(){
    var scripts = document.getElementsByTagName("script");
    return __currentScriptTag = scripts[scripts.length-1].src;
  })();

  // [共通関数] イベントセット
	var __event = function(target, mode, func , option , wait){
    option = (option) ? option : false;
    wait = (wait) ? wait : 0;
		if (target.addEventListener){target.addEventListener(mode, func, option)}
		else{target.attachEvent('on' + mode, function(){func.call(target , window.event)})}
	};

  // [共通関数] URL情報分解
	var __urlinfo = function(uri){
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
  var __upperSelector = function(elm , selectors) {
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
  var __checkFileAPI = function(){
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

  var __template = null;

  // [共通関数] JS読み込み時の実行タイミング処理（body読み込み後にJS実行する場合に使用）
	var __construct = function(){
    switch(document.readyState){
      case "complete"    : new $$;break;
      case "interactive" : __event(window , "DOMContentLoaded" , function(){new $$});break;
      default            : __event(window , "load" , function(){new $$});break;
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
    img_comment_button : "comment.svg", // 画像編集のコメント機能アイコン（デフォルト(null)は起動スクリプトと同一階層）

    // 機能（アイコン）表示フラグ
    flg_icon_comment : true,

    querys        : {},   // input type="hidden"の任意値のセット(cgiに送信する際の各種データ)
    postStringFormat : "",  // post-string-format ["":HTML-ENTITIES , encode:encodeURIComponent(php->urldecode())]

    // comment
    comment : {
      placeholder : "Comment...",
    },

    // dom構造(className)
    dom:{
      base : "fileUpload-base-sound",
        ul : "",
          li : "sound",
            num : "num",
              delete_button : "delete",
            audio_area : "audio-area",
              audio     : "audio",
                source  : "source",
            info    : "info",
              info_title : "info-title",
              info_time  : "info-time",
              info_size  : "info-size",
              info_type  : "info-type",
            idv3    : "idv3-area",

            control : "control",
              comment_button : "comment-icon",
            comment_area : "comment-area",
              comment_title : "comment-title",
              comment_form  : "comment-form",
            
          li_submit : "submit",
            btn_submit : "button_submit",
            btn_cancel : "button_cancel",
            uploading  : "uploading",
            uploading_dot : "dot"
    },

    file_select   : function(res){console.log(res)},  // ファイル選択直後の任意イベント処理
    post_success  : function(res){console.log(res)},  // 1ファイルファイル送信完了後の任意イベント処理
    post_finish   : function(res){console.log(res)},  // すべてのファイル送信完了後の任意イベント処理
    post_error    : function(res){console.log(res)}   // ファイル送信エラーの時の任意イベント処理
  };

  // ----------

  // インスタンスベースモジュール（初期設定処理）
  var $$ = function(options){

    this.options = this.replaceOptions(options);

    this.options.cacheTime = (+new Date());
    if(!this.options.currentPath && __currentScriptTag){
      var pathinfo = __urlinfo(__currentScriptTag);
      this.options.currentPath = pathinfo.dir;
    }

    // set-css
    this.setCss();
    this.setTemp();
    
    this.setTypeFile();

		// upload-button
    this.setButton();
    
  };

  

  // [初期設定] インスタンス引数を基本設定(options)と入れ替える
  $$.prototype.replaceOptions = function(options){
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
  $$.prototype.setCss = function(){
    var head = document.getElementsByTagName("head");
    var base = (head) ? head[0] : document.body;
    var current_pathinfo = __urlinfo(__currentScriptTag);
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
  $$.prototype.setTemp = function(){
    if(__template !== null){return}
    var current_pathinfo = __urlinfo(__currentScriptTag);
    var target_html = current_pathinfo.dir + current_pathinfo.file.replace(".js",".html");
    new $$ajax({
      url : target_html,
    method : "get",
    query : {
      exit : true
    },
    onSuccess : function(res){
      __template = res;
    }
    });
  };

  $$.prototype.getBase = function(){
    var lists = document.getElementsByClassName(this.options.dom.base);
    if(lists.length){
      return lists[0];
    }
    else{
      return null;
    }
  };

  // 処理用iframe内のform内のtype=fileを取得
  $$.prototype.getForm_typeFile = function(){
    return document.querySelector("input[name='fileupload_"+ this.options.cacheTime +"']");
  };

  // 編集画面の画像一覧リストの取得
  $$.prototype.getEditLists = function(){
    return document.querySelectorAll("."+this.options.dom.base+" ."+this.options.dom.li);
  };

  $$.prototype.setTypeFile = function(){
    var inp      = document.createElement("input");
		inp.type     = "file";
    inp.name     = "fileupload_" + this.options.cacheTime;
    inp.multiple = (this.options.file_multi) ? "multiple" : "";
    inp.style.setProperty("display","none","");
    inp.accept   = this.options.contentTypes.join(",");

    __event(inp , "change" , (function(e){
      if(typeof this.options.file_select === "function" && __checkFileAPI()){
        var input = e.currentTarget;
        this.viewEdit(input);
        this.options.file_select(e , this.options);
      }
    }).bind(this));
    document.body.appendChild(inp);

  };
  
  // [初期設定] データ読み込みボタンclickイベント処理
  $$.prototype.setButton = function(){
    var btns = document.querySelectorAll(this.options.btn_selector);
    for(var i=0; i<btns.length; i++){
      __event(btns[i] , "click" , (function(e){this.clickFileButton(e)}).bind(this));
    }
  };

  // データ取得ボタンクリック時の処理
  $$.prototype.clickFileButton = function(e){
    var typeFile = this.getForm_typeFile();
    typeFile.click();
  };


  // [画像編集] 送信前の画像編集操作処理
  $$.prototype.viewEdit = function(targetInputForm){
    this.viewBase();
    this.viewLists(targetInputForm);

    // システムデータ保持
    this.options.id = Math.floor((+new Date())/1000);
    this.options.count = targetInputForm.files.length;
  };


  // [画像編集] 編集画面表示（複数画像対応）
  $$.prototype.viewLists = function(filesElement){

    if(!filesElement){return;}

    var files = filesElement.files;
    if(!files || !files.length){return;}

    var bgs = document.getElementsByClassName(this.options.dom.base);
    if(!bgs || !bgs.length){return;}
    var bg = bgs[0];

    var ul = document.createElement("ul");
    bg.appendChild(ul);

    for(var i=0; i<files.length; i++){
      var li = this.setList(files[i] , i);
      ul.appendChild(li);
    }

    // submit,cancel-button
    var file_count = files.length;
    var li = this.setControlButtons(file_count);
    ul.appendChild(li);
  };


  // プレビュー表示の写真表示箇所のエレメントセット
  $$.prototype.setList = function(fl,i){
    
    var parser = new DOMParser();
    var doc = parser.parseFromString(__template, "text/html");
    var li = doc.querySelector("."+this.options.dom.li);
    li.setAttribute("data-num" , i);

    var audio  = li.querySelector("."+this.options.dom.audio);
    var source = audio.querySelector("."+this.options.dom.source);

    var path = URL.createObjectURL(fl);
    source.src = path;

    audio.setAttribute("data-num"    , i);
    audio.setAttribute("data-type"   , fl.type);
    audio.setAttribute("data-size"   , fl.size);

    var info_time = li.querySelector("."+this.options.dom.info_time);
    if(info_time){
      __event(audio , "loadedmetadata" , (function(info_time,e){
        var audio = e.target;
        var tm = audio.duration;
        info_time.textContent = this.setFormatTime(tm);
        audio.setAttribute("data-time"   , audio.duration);
      }).bind(this,info_time));
    }
    
    var info_title = li.querySelector("."+this.options.dom.info_title);
    if(info_title){
      var title = fl.name
      // title = title.replace(/\.mp3/,"");
      info_title.textContent = title;
    }

    var info_type = li.querySelector("."+this.options.dom.info_type);
    if(info_type){
      info_type.textContent = fl.type;
    }

    var info_size = li.querySelector("."+this.options.dom.info_size);
    if(info_size){
      var size = fl.size;
      info_size.textContent = (size.length <= 6) ? this.convertSize_b2k(size) : this.convertSize_b2m(size);
    }
    

    // var control = li.querySelector("."+this.options.dom.control);
    // control.setAttribute("data-num" , i);

    var delElement = li.querySelector("."+this.options.dom.delete_button);
    delElement.src = (this.options.img_delete_button !== null) ? this.options.img_delete_button : this.options.currentPath + "delete.svg";
    __event(delElement , "click" , (function(e){this.clickDeleteButton(e)}).bind(this));

    var commentButton = li.querySelector("."+this.options.dom.comment_button);
    commentButton.src = (typeof this.options.img_comment_button !== "undefined" || this.options.img_comment_button) ? this.options.img_comment_button : this.options.currentPath + "comment.svg";
    commentButton.setAttribute("data-view" , (this.options.flg_icon_comment === true) ? 1 : 0);
    __event(commentButton , "click" , (function(e){this.clickCommentButton(e)}).bind(this));

    var commentForm = li.querySelector("."+this.options.dom.comment_form);
    if(commentForm){
      commentForm.placeholder = (this.options.comment.placeholder) ? this.options.comment.placeholder : "";
    }



    // IDv3
    var reader = new FileReader();
    reader.readAsArrayBuffer(fl);
    reader.onload = function(e){
      var id3v1 = (new Uint8Array(e.target.result)).slice(-128);
// console.log(id3v1);
      var judge = id3v1[0] + id3v1[1] + id3v1[2];
// console.log(judge);
      if (judge == 220) {
        var str = "";
        var arr = [];
        var num = 0;
        for (var i=0; i<=127; i++) {
          // if (i == 33 || i == 63){str += "\n";}
          // str += String.fromCharCode(id3v1[i]);
          // arr.push(id3v1[i]);
          if (i == 3 || i == 33 || i == 63 || i == 93 || i == 97 || i == 127){num++}
          arr[num] = (typeof arr[num] !== "undefined") ? arr[num] : "";
          arr[num] += String.fromCharCode(id3v1[i]);
// console.log(id3v1[i]+",");
          // if (i == 33 || i == 63) trackInfo.innerHTML += '<br>';
          // trackInfo.innerHTML += String.fromCharCode(id3v1[i]);
        }
// console.log(str);
// console.log(arr);
// console.log(Encoding.convert(arr , "SJIS" , "UTF-8"));
// console.log(Encoding.convert(str , "UNICODE" , "SJIS"));
// console.log(unescape(str));
// console.log(encodeURIComponent(str));
// console.log(unescape(encodeURIComponent(str)));
// console.log(decodeURIComponent(escape(unescape(encodeURIComponent(str)))));
for(var i=0; i<arr.length; i++){
  console.log(i +" : "+ Encoding.convert(arr[i] , "UNICODE" , "SJIS"));
}
      }
      else{
console.log("No - IDv3 tag.");
      }
    };


    return li;
  };


  // submit,cancel-button
  $$.prototype.setControlButtons = function(file_count){
    var li = document.createElement("li");
    li.className = this.options.dom.li_submit;

    var sendButton = document.createElement("button");
    if(file_count > 1){
      sendButton.innerHTML = "すべて送信";
    }
    else{
      sendButton.innerHTML = "送信";
    }
    
    __event(sendButton , "click" , (function(e){this.clickSendButton(e)}).bind(this));
    li.appendChild(sendButton);

    var cancelButton = document.createElement("button");
    cancelButton.innerHTML = "キャンセル";
    __event(cancelButton , "click" , (function(e){this.clickCancel(e)}).bind(this));
    li.appendChild(cancelButton);

    var uploading = document.createElement("div");
    uploading.className = this.options.dom.uploading;
    li.appendChild(uploading);
    for(var i=0; i<12;i++){
      var dot = document.createElement("div");
      dot.className = this.options.dom.uploading_dot;
      uploading.appendChild(dot);
    }

    return li;
  };

  


  // [画像編集] BG表示
  $$.prototype.viewBase = function(){
    var bg = document.createElement("div");
    bg.className = this.options.dom.base;
    document.body.appendChild(bg);
  };


  //
  $$.prototype.clickDeleteButton = function(e){
    if(!confirm("アップロードリストから写真を破棄しますか？※直接撮影された写真は保存されません。")){return;}

    var target = e.currentTarget;
    var li = __upperSelector(target , ["."+this.options.dom.li]);
    if(!li){return;}
    var num = li.getAttribute("data-num");
    if(num === null){return;}

    var targetListBase = document.querySelector("."+this.options.dom.base+" ul li."+this.options.dom.li+"[data-num='"+num+"']");
    if(!targetListBase){return;}

    targetListBase.parentNode.removeChild(targetListBase);

    // ラスト１つを削除した場合は、キャンセル扱い
    var lists = this.getEditLists();
    if(!lists || !lists.length){
      this.clickCancel();
    }

    // キャッシュデータを更新
    this.options.count = lists.length;
  }


  // 
  $$.prototype.clickCancel = function(){

    var base = this.getBase();
    if(base){
      base.parentNode.removeChild(base);
    }

    var input = this.getForm_typeFile();
    input.value = "";

  };



  $$.prototype.clickSendButton = function(e){
    var files = this.getForm_typeFile().files;
    var lists = this.getEditLists();
    for(var i=0; i<lists.length; i++){
      var num = lists[i].getAttribute("data-num");
      this.postFiles_cache.push(files[num]);
    }

    // uploading フラグ設置
    var submitArea = document.querySelector("."+this.options.dom.base+" li."+this.options.li_submit);
    if(submitArea){
      submitArea.setAttribute("data-uploading","1");
    }

    if(this.postFiles_cache.length > 0){
      this.postFile(lists[0]);
    }
  };

  $$.prototype.clickCommentButton = function(e){
    var button = e.currentTarget;
    var li = __upperSelector(button , ["."+this.options.dom.li]);
    if(!li){return}
    var comment_area = li.querySelector("."+this.options.dom.comment_area);

    var comment_form = comment_area.querySelector("."+this.options.dom.comment_form);

    if(comment_area.getAttribute("data-view") === "0" || comment_form.value !== ""){
      comment_area.setAttribute("data-view","1");
    }
    else{
      comment_area.setAttribute("data-view","0");
    }
  }

  

  $$.prototype.postFiles_cache = [];
  $$.prototype.postFile = function(viewListElement){

    if(!window.FormData){
      console.log("データ送信機能がブラウザに対応していません。");
      return;
    }

    if(!window.XMLHttpRequest){
      console.log("AJAX機能がブラウザに対応していません。");
      return;
    }

    // 全て送信完了したら編集画面を閉じる
    if(!this.postFiles_cache.length){
      this.clickCancel();
      return;
    }

    var fd   = new FormData();
    if(this.options.querys){
      for(var i in this.options.querys){
        fd.append(i , this.options.querys[i]);
      }
    }
    fd.append("id"           , this.options.id);
    fd.append("num"          , (this.options.count - this.postFiles_cache.length));
    fd.append("audioFile"    , this.postFiles_cache[0]);
    fd.append("info[file]"   , this.set_postStringFormat(this.postFiles_cache[0].name));
    fd.append("info[modi]"   , this.set_postStringFormat(this.postFiles_cache[0].lastModified));
    fd.append("info[date]"   , this.set_postStringFormat(Date.parse(this.postFiles_cache[0].lastModifiedDate)));
    
    var audio = viewListElement.querySelector("."+ this.options.dom.audio);
    fd.append("info[type]"   , this.set_postStringFormat((audio.getAttribute("data-type"))));
    fd.append("info[size]"   , this.set_postStringFormat((audio.getAttribute("data-size"))));
    fd.append("info[time]"   , this.set_postStringFormat((audio.getAttribute("data-time"))));

    // comment
    var comment = viewListElement.querySelector("."+ this.options.dom.comment_form);
    if(comment){
      fd.append("info[comment]" , this.set_postStringFormat(comment.value));
    }

    var lists = this.getEditLists();
    if(!lists.length){return;}

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = (function(xhr,e){
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
              var finish_flg = this.post_success();

              // ユーザー処理
              if(this.options.post_success){
                this.options.post_success(xhr.responseText , this.options);
              }

              // 複数ファイル完了処理
              if(finish_flg === true){
                this.options.post_finish(xhr.responseText , this.options);
              }

              break;
            case 404 :
              console.log("Error (404) : Not found. " + res);
              
              if(this.options.post_error){
                this.options.post_error(xhr.responseText , this.options)
              }
              break;
            default :
              console.log("Error");
              break;
          }
          break;
      }
    }).bind(this,xhr);
    var url = (this.options.url) ? this.options.url : location.href;
    xhr.open('POST', url);
    xhr.send(fd);

  };

  $$.prototype.set_postStringFormat = function(str){
    if(typeof str !== "string"){return str;}
    switch(this.options.postStringFormat){
      case "encode":
        return encodeURIComponent(str);

      default:
        return str;
    }
  };

  $$.prototype.post_success = function(){

    // メモリしてあるファイル一覧から送信済みを削除
    if(this.postFiles_cache.length){
      this.postFiles_cache.shift();
    }

    // 表示一覧から送信済みを削除
    var lists = this.getEditLists();
    if(lists.length){
      lists[0].parentNode.removeChild(lists[0]);
    }

    // 送信後の削除処理をした直後のエレメント一覧の取得
    var lists = this.getEditLists();

    // 次のファイルが存在
    if(lists.length){
      setTimeout((function(lists,e){this.postFile(lists)}).bind(this,lists[0]) , 100);
      return false;
    }

    // 最終完了
    else{
      // 表示を閉じる
      this.clickCancel();
      return true;
    }
  };



  $$.prototype.convertSize_b2k = function(bite){
    bite = (bite) ? Number(bite) : 0;
    var kiro = String((Math.round(bite / 1000 * 10)) / 10);
    return kiro + " KB";
  }
  $$.prototype.convertSize_b2m = function(bite){
    bite = (bite) ? Number(bite) : 0;
    var kiro = String((Math.round(bite / 1000 / 1000 * 10)) / 10);
    return kiro + " MB";
  }

  $$.prototype.setFormatTime = function(time){
		var time2 = parseInt(time * 10 , 10) /10;
		var m = parseInt(time2 / 60 , 10);
		m = (m < 10) ? "0" + m.toFixed() : m.toFixed();
		var s = parseInt(time2 % 60 , 10);
		s = (s < 10) ? "0" + s.toFixed() : s.toFixed();
		var ms = parseInt((time % 1) * 100 , 10);
		ms = (ms < 10) ? "0" + ms.toFixed() : ms.toFixed();
		return m +":"+ s +":"+ ms;
	};


  
  return $$;

})();
