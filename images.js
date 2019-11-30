;$$fileupload_image = (function(){

  var LIB     = function(){};
  var SET     = function(){};
  var GET     = function(){};
  var ACTION  = function(){};
  var VIEW    = function(){};
  var TRIM    = function(){};
  var POST    = function(){};

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

  // // [共通関数] JS読み込み時の実行タイミング処理（body読み込み後にJS実行する場合に使用）
	// LIB.prototype.construct = function(){
  //   var lib = new LIB();

  //   switch(document.readyState){
  //     case "complete"    : new MAIN;break;
  //     case "interactive" : lib.event(window , "DOMContentLoaded" , function(){new MAIN});break;
  //     default            : lib.event(window , "load" , function(){new MAIN});break;
	// 	}
  // };

  LIB.prototype.convertSize_b2k = function(bite){
    bite = (bite) ? Number(bite) : 0;
    var kiro = String((Math.round(bite / 1000 * 10)) / 10);
    return kiro + " KB";
  }
  LIB.prototype.convertSize_b2m = function(bite){
    bite = (bite) ? Number(bite) : 0;
    var kiro = String((Math.round(bite / 1000 / 1000 * 10)) / 10);
    return kiro + " MB";
  }


  var __options = {
    id            : null, // インスタンス（送信用とする）識別子 : システム利用用（設定不可）
    count         : null, // 送信する画像の総合枚数（送信ボタンを押すと確定） : システム利用用（設定不可）
    cacheTime     : null, // システム利用用（設定不可）
    currentPath   : null, // システム利用用（設定不可）

    btn_selector  : "#fileupload", // クリックするボタンのselectors（複数対応）

    // 画像アップロード前のプレビュー用
    css_path      : null, // 表示系cssの任意指定（デフォルト(null)は起動スクリプトと同一階層）
    file_multi    : true, // 複数ファイルアップロード対応 [ true : 複数  , false : 1つのみ]
    contentTypes  : ["image/gif" , "image/jpeg" , "image/png"],
    img_rotate_button  : null, // 画像編集の回転機能アイコン（デフォルト(null)は起動スクリプトと同一階層）
    img_delete_button  : null, // 画像編集の削除機能アイコン（デフォルト(null)は起動スクリプトと同一階層）
    img_comment_button : null, // 画像編集のコメント機能アイコン（デフォルト(null)は起動スクリプトと同一階層）
    img_trim_button    : null,

    // 機能（アイコン）表示フラグ
    flg_icon_rotate  : true,
    flg_icon_trim    : true,
    flg_icon_comment : true,

    // post-data
    querys        : {},   // input type="hidden"の任意値のセット(cgiに送信する際の各種データ)
    postStringFormat : "",  // post-string-format ["":HTML-ENTITIES , encode:encodeURIComponent(php->urldecode())]

    // comment
    comment : {
      placeholder : "Comment...",
    },

    // dom構造(className)
    dom:{
      base : "fileUpload-base",
        ul : "",
          li : "pic",
            num      : "num",
              filename : "filename",
              delete : "delete",
            img_area : "img-area",
              img     : "picture",
            info    : "info",
              info_pixel : "info-pixel",
              info_size  : "info-size",
              info_type  : "info-type",
            control : "control",
              rotate  : "rotate",
              trim    : "trim",
              comment : "comment",
            trim_area : "trim-area",
              trim_relative : "trim-relative",
                trim_box     : "trim-box",
                trim_pointer : "trim-pointer",
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

    image_template : null,

    trim_pointer_target   : null,
    trim_pointer_position : null,
    trim_pointer_cursor   : null,
    trim_pointer_parent   : null,
    trim_pointer_imgSize  : null,
    trim_box : {
      target   : null,
      position : null,
      cursor   : null
    }
  };


  // ----------
  // MAIN

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
    set.setTemp_image(main);
    
    set.setTypeFile(main);

		// upload-button
    set.setButton(main);
    
    // event
    set.event(main);

  };

  // ----------
  // SET : setting

  SET.prototype.event = function(main){
    var lib = new LIB();
    lib.event(window , "mousedown" , (function(main,e){new TRIM().trim_pointer_down(main,e , e.pageX , e.pageY)}).bind(this,main));
    lib.event(window , "mousemove" , (function(main,e){new TRIM().trim_pointer_move(main,e , e.pageX , e.pageY)}).bind(this,main));
    lib.event(window , "mouseup"   , (function(main,e){new TRIM().trim_pointer_up(main,e , e.pageX , e.pageY)}).bind(this,main));

    lib.event(window , "touchstart" , (function(main,e){new TRIM().trim_pointer_down(main,e , e.changedTouches[0].pageX , e.changedTouches[0].pageY)}).bind(this,main) , {passive:false});
    lib.event(window , "touchmove"  , (function(main,e){new TRIM().trim_pointer_move(main,e , e.changedTouches[0].pageX , e.changedTouches[0].pageY)}).bind(this,main) , {passive:false});
    lib.event(window , "touchend"   , (function(main,e){new TRIM().trim_pointer_up(main,e , e.changedTouches[0].pageX , e.changedTouches[0].pageY)}).bind(this,main) , {passive:false});
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
  SET.prototype.setTemp_image = function(main){
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
        main.options.image_template = res;
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

  SET.prototype.setTypeFile = function(main){
    var main = main;
    var lib  = new LIB();
    var view = new VIEW();

    var inp      = document.createElement("input");
		inp.type     = "file";
    inp.name     = "fileupload_" + main.options.cacheTime;
    inp.multiple = (main.options.file_multi) ? "multiple" : "";
    inp.style.setProperty("display","none","");
    inp.accept   = main.options.contentTypes.join(",");

    lib.event(inp , "change" , (function(main,e){
      var lib = new LIB();
      if(typeof main.options.file_select === "function" && lib.checkFileAPI()){
        var input = e.currentTarget;
        view.viewImageEdit(main , input);
        main.options.file_select(e , main.options);
      }
    }).bind(this , main));
    document.body.appendChild(inp);
  };
  
  // [初期設定] データ読み込みボタンclickイベント処理
  SET.prototype.setButton = function(main){
    var main = main;
    var lib  = new LIB();

    var btns = document.querySelectorAll(main.options.btn_selector);
    for(var i=0; i<btns.length; i++){
      lib.event(btns[i] , "click" , (function(main,e){new ACTION().clickFileButton(main,e)}).bind(this,main));
    }
  };



  // ----------
  // GET

  // 処理用form内のtype=fileを取得
  GET.prototype.getForm_typeFile = function(main){
    return document.querySelector("input[name='fileupload_"+ main.options.cacheTime +"']");
  };

  // 編集画面の画像一覧リストの取得
  GET.prototype.getEditImageLists = function(main){
    return document.querySelectorAll("."+main.options.dom.base+" ."+main.options.dom.li);
  };



  // ----------
  // ACTION

  // データ取得ボタンクリック時の処理
  ACTION.prototype.clickFileButton = function(main,e){
    var main = main;
    var get  = new GET();

    var typeFile = get.getForm_typeFile(main);
    typeFile.click();
  };




  // ----------
  // VIEW

  // [画像編集] 送信前の画像編集操作処理
  VIEW.prototype.viewImageEdit = function(main,targetInputForm){
    var main = main;
    var view = this;
    
    view.viewBG(main);
    view.viewImages(main , targetInputForm);

    // システムデータ保持
    main.options.id = Math.floor((+new Date())/1000);
    main.options.count = targetInputForm.files.length;
  };


  // [画像編集] 編集画面表示（複数画像対応）
  VIEW.prototype.viewImages = function(main,filesElement){
    if(!filesElement){return;}
    var main = main;
    var set  = new SET();
    var view = this;

    var files = filesElement.files;
    if(!files || !files.length){return;}

    var bgs = document.getElementsByClassName(main.options.dom.base);
    if(!bgs || !bgs.length){return;}
    var bg = bgs[0];

    var ul = document.createElement("ul");
    bg.appendChild(ul);

    for(var i=0; i<files.length; i++){
      var li = view.setList(main , files[i] , i);
      ul.appendChild(li);
    }

    // submit,cancel-button
    var file_count = files.length;
    var li = set.setControlButtons(main , file_count);
    ul.appendChild(li);
  };


  // プレビュー表示の写真表示箇所のエレメントセット
  VIEW.prototype.setList = function(main , fl , i){
    var main = main;
    var lib  = new LIB();

    var parser = new DOMParser();
    var doc = parser.parseFromString(main.options.image_template, "text/html");
    var li = doc.querySelector("."+main.options.dom.li);
    li.setAttribute("data-num" , i);

    var img = li.querySelector("."+main.options.dom.img);

    img.setAttribute("data-num"    , i);
    img.setAttribute("data-type"   , fl.type);
    img.setAttribute("data-size"   , fl.size);
    lib.event(img , "load" , (function(main,e){
      new SET().loadedImage(main , e);
      new TRIM().setTrimPreview(main , e.target);

      // set-info
      var parent = lib.upperSelector(e.target , ["."+main.options.dom.li]);
      if(!parent){return;}
      var pid = parent.getAttribute("data-num");
      new VIEW().setInfo(main , pid , e.target);
    }).bind(this,main));
    var path = URL.createObjectURL(fl);
    img.src = path;


//     var fileReader = new FileReader();
//     lib.event(fileReader , "load" , (function(main,img,fl,num,e){

//       img.src = e.target.result;
//       img.setAttribute("data-num"    , num);
//       img.setAttribute("data-type"   , fl.type);
//       img.setAttribute("data-size"   , fl.size);
// // console.log(img);

//       new SET().loadedImage(main , {target:img});
//       new TRIM().setTrimPreview(main , img);

//       // set-info
//       var parent = lib.upperSelector(img , ["."+main.options.dom.li]);
//       if(!parent){return;}
//       var pid = parent.getAttribute("data-num");
//       new VIEW().setInfo(main , pid , img);
//     }).bind(this,main,img,fl,i));
//     fileReader.readAsDataURL(fl);

//     console.log(fileReader);



    // var path = URL.createObjectURL(fl);
// console.log(path);
// console.log(new FileReader().readAsDataURL(fl));
    // var path = URL.createObjectURL(fl,"text/plane");

    

    var control = li.querySelector("."+main.options.dom.control);
    control.setAttribute("data-num" , i);

    var rotateImage = li.querySelector("."+main.options.dom.rotate);
    rotateImage.src = (main.options.img_rotate_button !== null) ? main.options.img_rotate_button : main.options.currentPath + "img/rotate.svg";
    rotateImage.setAttribute("data-view" , (main.options.flg_icon_rotate === true) ? 1 : 0);
    lib.event(rotateImage , "click" , (function(main,e){new ACTION().clickRotateButton(main,e)}).bind(this,main));

    var delImage = li.querySelector("."+main.options.dom.delete);
    delImage.src = (main.options.img_delete_button !== null) ? main.options.img_delete_button : main.options.currentPath + "img/delete.svg";
    lib.event(delImage , "click" , (function(main,e){new ACTION().clickDeleteButton(main,e)}).bind(this,main));

    var trimImage = li.querySelector("."+main.options.dom.trim);
    trimImage.src = (main.options.img_trim_button !== null) ? main.options.img_trim_button : main.options.currentPath + "img/crop.svg";
    trimImage.setAttribute("data-view" , (main.options.flg_icon_trim === true) ? 1 : 0);
    lib.event(trimImage , "click" , (function(main,e){new ACTION().clickTrimButton(main,e)}).bind(this,main));

    var commentButton = li.querySelector("."+main.options.dom.comment);
    commentButton.src = (main.options.img_comment_button !== null) ? main.options.img_comment_button : main.options.currentPath + "img/comment.svg";
    commentButton.setAttribute("data-view" , (main.options.flg_icon_comment === true) ? 1 : 0);
    lib.event(commentButton , "click" , (function(main,e){new ACTION().clickCommentButton(main,e)}).bind(this,main));

    var filename = li.querySelector("."+main.options.dom.filename);
    if(filename){
      filename.textContent = fl.name;
    }

    var commentForm = li.querySelector("."+main.options.dom.comment_form);
    if(commentForm){
      commentForm.placeholder = (main.options.comment.placeholder) ? main.options.comment.placeholder : "";
    }

    return li;
  };


  // モーダル表示infoの書き換え
  VIEW.prototype.setInfo = function(main , pid , img){
    if(pid === "undefined" || !img){return;}
    var main = main;
    var lib  = new LIB();

    var info = document.querySelector("."+main.options.dom.base+" ."+main.options.dom.li+"[data-num='"+pid+"']");

    var w = img.getAttribute("data-width");
    var h = img.getAttribute("data-height");

    var w2 = img.getAttribute("data-trim-width");
    var h2 = img.getAttribute("data-trim-height");

    w = (w2) ? w2 : w;
    h = (h2) ? h2 : h;

    if(info){
      var pixel = info.querySelector("."+main.options.dom.info_pixel);
      if(pixel){
        pixel.textContent = "W: "+ Number(w).toLocaleString() + " H: "+ Number(h).toLocaleString();
      }
      var type  = info.querySelector("."+main.options.dom.info_type);
      if(type){
        type.textContent = img.getAttribute("data-type");
      }
      var size  = info.querySelector("."+main.options.dom.info_size);
      if(size){
        var num = img.getAttribute("data-size");
        var val = (num.length <= 6) ? lib.convertSize_b2k(num) : lib.convertSize_b2m(num);
        size.textContent = val;
      }
    }
  };

  // [画像編集] BG表示
  VIEW.prototype.viewBG = function(main){
    var bg = document.createElement("div");
    bg.className = main.options.dom.base;
    document.body.appendChild(bg);
  };



  GET.prototype.getImageSize = function(img){
    if(!img){return}

    var base = {
      w : Number(img.getAttribute("data-width")),
      h : Number(img.getAttribute("data-height"))
    };

    // 横長
    if(base.w > base.h){
      var aspect = base.h / base.w;
      var w = img.offsetWidth;
      var h = w * aspect
      var t = (w / 2) - (h / 2);
      var rate = w / base.w;
      return {
        rate   : rate,
        top    : t,
        left   : 0,
        width  : Math.floor(w),
        height : Math.floor(h)
      };
    }
    // 縦長
    else if(base.w < base.h){
      var aspect = base.w / base.h;
      var h = img.offsetHeight;
      var w = h * aspect;
      var l = (h / 2) - (w / 2);
      var rate = h / base.h;
      return {
        rate   : rate,
        top    : 0,
        left   : l,
        width  : Math.floor(w),
        height : Math.floor(h)
      };
    }
    // 正方形
    else{
      return {
        rate   : img.offsetWidth / base.w,
        top    : 0,
        left   : 0,
        width  : Math.floor(img.offsetWidth),
        height : Math.floor(img.offsetHeight)
      };
    }
  };


  // submit,cancel-button
  SET.prototype.setControlButtons = function(main , file_count){
    var main = main;
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
    
    lib.event(sendButton , "click" , (function(main,e){new SET().clickSendButton(main,e)}).bind(this,main));
    li.appendChild(sendButton);

    var cancelButton = document.createElement("button");
    cancelButton.innerHTML = "キャンセル";
    lib.event(cancelButton , "click" , (function(main,e){new ACTION().clickCancel(main,e)}).bind(this,main));
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

  


  // [画像編集] rotateボタンを押した時の処理（左に90度回転）
  ACTION.prototype.clickRotateButton = function(main,e){
    var main = main;
    var lib  = new LIB();
    var trim = new TRIM();

    var target = e.currentTarget;

    var num = target.parentNode.getAttribute("data-num");
    if(num === null){return;}

    var targetImage = document.querySelector("."+main.options.dom.base+" ul li."+main.options.dom.li+"[data-num='"+num+"'] img."+main.options.dom.img);
    if(!targetImage){return;}

    var beforeRotateNum = targetImage.getAttribute("data-rotate");
    var rotateNum = (beforeRotateNum) ? beforeRotateNum : "0";

    // 反時計回りに回転
    switch(rotateNum){
      case "0":
        rotateNum = 270;
        break;
      case "90":
        rotateNum = 0;
        break;
      case "180":
        rotateNum = 90;
        break;
      case "270":
        rotateNum = 180;
        break;
    }
    targetImage.setAttribute("data-rotate" , rotateNum);

    // trim-rotate
    trim.setTrimRotate_reset(main , lib.upperSelector(target , ["."+main.options.dom.li]) , rotateNum);
  };

  //
  ACTION.prototype.clickDeleteButton = function(main,e){
    if(!confirm("アップロードリストから写真を破棄しますか？※直接撮影された写真は保存されません。")){return;}
    var main = main;
    var lib  = new LIB();
    var get  = new GET();
    var action = this;

    var target = e.currentTarget;
    var li = lib.upperSelector(target,["."+main.options.dom.li]);
    if(!li){return;}
    var num = li.getAttribute("data-num");
    if(num === null){return;}

    var targetListBase = document.querySelector("."+main.options.dom.base+" ul li."+main.options.dom.li+"[data-num='"+num+"']");
    if(!targetListBase){return;}

    targetListBase.parentNode.removeChild(targetListBase);

    // ラスト１つを削除した場合は、キャンセル扱い
    var lists = get.getEditImageLists(main);
    if(!lists || !lists.length){
      action.clickCancel(main);
    }

    // キャッシュデータを更新
    main.options.count = lists.length;
  }

  ACTION.prototype.clickTrimButton = function(main,e){
    var main = main;
    var lib  = new LIB();

    var target = e.currentTarget;
    if(!target){return}
    var parent = lib.upperSelector(target , ["."+main.options.dom.li]);
    if(!parent){return}
    var trim_area = parent.querySelector("."+main.options.dom.trim_area);
    if(!trim_area){return}
    if(trim_area.getAttribute("data-visible") === "1"){
      trim_area.removeAttribute("data-visible");
    }
    else{
      trim_area.setAttribute("data-visible","1");
    }
  };

  ACTION.prototype.clickCommentButton = function(main,e){
    var main = main;
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

  // 
  ACTION.prototype.clickCancel = function(main){
    var main = main;
    var get  = new GET();

    var base = get.getBase(main);
    if(base){
      base.parentNode.removeChild(base);
    }

    var input = get.getForm_typeFile(main);
    input.value = "";
  };

  // 画像を読み込んだ際のイベント処理
  SET.prototype.loadedImage = function(main , e){
    var main = main;

    var img = e.target;

    img.setAttribute("data-width"     , img.naturalWidth);
    img.setAttribute("data-height"    , img.naturalHeight);

    // exif-orientation
    if(typeof window.EXIF !== "undefined"){
      var res = EXIF.getData(img , (function(main , img , e) {
        var exifData = EXIF.getAllTags(img);
        new SET().setOrientation(main , img , exifData);
        img.setAttribute("data-exif" , JSON.stringify(exifData));
      }).bind(this , main , img));
    }
  };

  SET.prototype.setOrientation = function(main , img , exifData){
    if(!img || !exifData || !exifData.Orientation){return}
    if(exifData.Orientation != 6 && exifData.Orientation != 8){return}
    var main = main;
    var lib  = new LIB();
    var trim = new TRIM();

    var img_area = lib.upperSelector(img , ["."+main.options.dom.img_area]);
    var orientation = (this.isIOSdevice()) ? 1 : exifData.Orientation;
    img_area.setAttribute("data-orientation" , orientation);
    var pic = lib.upperSelector(img_area , ["."+main.options.dom.li]);
    trim.setTrimRotate_reset(main , pic , 0);
  };

  SET.prototype.isIOSdevice = function(){
    if(typeof window.ontouchstart === "undefined"){
      return false;
    }
    if(navigator.userAgent.indexOf("iPhone") !== -1
    || navigator.userAgent.indexOf("iPad") !== -1
    || navigator.userAgent.indexOf("Macintosh") !== -1){
      return true;
    }
    else{
      return false;
    }
  }

  SET.prototype.clickSendButton = function(main,e){
    var main = main;
    var get  = new GET();
    var post = new POST();
    
    var files = get.getForm_typeFile(main).files;
    var lists = get.getEditImageLists(main);
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
    var main = main;
    var lib  = new LIB();
    var set  = new SET();
    var get  = new GET();
    var post = new POST();

    // areaに送信中フラグをセット
    var area = viewListElement.querySelector("."+main.options.dom.img_area);
    if(area){
      area.setAttribute("data-uploading" , "1");
    }

    // 全て送信完了したら編集画面を閉じる
    if(!post.postFiles_cache.length){
      action.clickCancel(main);
      return;
    }
    var fd   = new FormData();
    if(main.options.querys){
      for(var i in main.options.querys){
        fd.append(i , main.options.querys[i]);
      }
    }
    fd.append("id"           , main.options.id);
    fd.append("num"          , (main.options.count - post.postFiles_cache.length));
    fd.append("imageFile"    , post.postFiles_cache[0]);
    fd.append("info[name]"   , post.set_postStringFormat(main , post.postFiles_cache[0].name));
    fd.append("info[size]"   , post.set_postStringFormat(main , post.postFiles_cache[0].size));
    fd.append("info[type]"   , post.set_postStringFormat(main , post.postFiles_cache[0].type));
    fd.append("info[modi]"   , post.set_postStringFormat(main , post.postFiles_cache[0].lastModified));
    fd.append("info[date]"   , post.set_postStringFormat(main , Date.parse(post.postFiles_cache[0].lastModifiedDate)));
    
    var img = viewListElement.querySelector("."+ main.options.dom.img);
    var rotate = (img.getAttribute("data-rotate")) ? img.getAttribute("data-rotate") : "";
    fd.append("info[rotate]" , rotate);
    fd.append("info[width]"  , img.getAttribute("data-width"));
    fd.append("info[height]" , img.getAttribute("data-height"));

    // comment
    var comment = viewListElement.querySelector("."+ main.options.dom.comment_form);
    if(comment){
      fd.append("info[comment]" , post.set_postStringFormat(main , comment.value));
    }

    // trim
    var parent = lib.upperSelector(img , ["."+main.options.dom.li]);
    var trim_area = parent.querySelector("."+main.options.dom.trim_area);
    var trim_w       = img.getAttribute("data-trim-width");
    var trim_h       = img.getAttribute("data-trim-height");
    var trim_x       = img.getAttribute("data-trim-x");
    var trim_y       = img.getAttribute("data-trim-y");
    if(trim_area.getAttribute("data-visible") == 1){
      fd.append("trim[top]"    , trim_y);
      fd.append("trim[left]"   , trim_x);
      fd.append("trim[width]"  , trim_w);
      fd.append("trim[height]" , trim_h);
    }

    var lists = get.getEditImageLists(main);
    if(!lists.length){return;}

    var img = lists[0].querySelector(".img-area img.picture");
    var exifData = img.getAttribute("data-exif");
    if(exifData){
      fd.append("exif" , exifData);
    }

    var xhr = new XMLHttpRequest();
    var url = (main.options.url) ? main.options.url : location.href;
    xhr.open('POST', url ,true);
    
    xhr.onreadystatechange = (function(main,xhr,e){
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
    var main = main;
    var get  = new GET();
    var action = new ACTION();
    var post   = new POST();

    // メモリしてあるファイル一覧から送信済みを削除
    if(post.postFiles_cache.length){
      post.postFiles_cache.shift();
    }

    // 表示一覧から送信済みを削除
    var lists = get.getEditImageLists(main);
    if(lists.length){
      lists[0].parentNode.removeChild(lists[0]);
    }

    // 送信後の削除処理をした直後のエレメント一覧の取得
    var lists = get.getEditImageLists(main);

    // 次のファイルが存在
    if(lists.length){
      setTimeout((function(main,lists,e){new POST().postFile(main , lists)}).bind(this,main,lists[0]) , 100);
      return false;
    }

    // 最終完了
    else{
      // 表示を閉じる
      action.clickCancel(main);
      return true;
    }
  };


  // ----------
  // TRIM

  // trim-control
  TRIM.prototype.setTrimPreview = function(main , img){
    var main = main;
    var lib  = new LIB();
    var trim = this;
    var get  = new GET();

    var imgSize = get.getImageSize(img);
    if(!imgSize){return}
    var area = lib.upperSelector(img , ["."+main.options.dom.li]+" ."+main.options.dom.img_area);

    var trim_elm = area.querySelector("."+main.options.dom.trim_area);
    if(trim_elm){
      trim_elm.parentNode.removeChild(trim_elm);
    }

    // area + relative
    var trim_area = document.createElement("div");
    trim_area.className = main.options.dom.trim_area;
    area.appendChild(trim_area);

    var trim_relative = document.createElement("div");
    trim_relative.className = main.options.dom.trim_relative;
    trim.setElementStyle_relative(main , trim_relative , img);
    trim_area.appendChild(trim_relative);

    // pointer-area
    var trim_box = document.createElement("div");
    trim_box.className = main.options.dom.trim_box;
    trim_box.style.setProperty("top"    , "0px"  , "");
    trim_box.style.setProperty("bottom" , "0px"  , "");
    trim_box.style.setProperty("left"   , "0px"  , "");
    trim_box.style.setProperty("right"  , "0px"  , "");
    trim_relative.appendChild(trim_box);

    // var img_area = li.querySelector("."+this.options.dom.img_area);

    // pointer : top-left
    var trim_pointer_1 = document.createElement("div");
    trim_pointer_1.className = main.options.dom.trim_pointer;
    trim_pointer_1.setAttribute("data-type","top-left");
    trim_pointer_1.style.setProperty("top"  , "0px" , "");
    trim_pointer_1.style.setProperty("left" , "0px" , "");
    trim_relative.appendChild(trim_pointer_1);

    // pointer : top-right
    var trim_pointer_2 = document.createElement("div");
    trim_pointer_2.className = main.options.dom.trim_pointer;
    trim_pointer_2.setAttribute("data-type","top-right");
    trim_pointer_2.style.setProperty("top"  , "0px" , "");
    trim_pointer_2.style.setProperty("left" , imgSize.width + "px" , "");
    trim_relative.appendChild(trim_pointer_2);

    // pointer : bottom-left
    var trim_pointer_3 = document.createElement("div");
    trim_pointer_3.className = main.options.dom.trim_pointer;
    trim_pointer_3.setAttribute("data-type","bottom-left");
    trim_pointer_3.style.setProperty("top"  , imgSize.height + "px" , "");
    trim_pointer_3.style.setProperty("left" , "0px" , "");
    trim_relative.appendChild(trim_pointer_3);

    // pointer : bottom-right
    var trim_pointer_4 = document.createElement("div");
    trim_pointer_4.className = main.options.dom.trim_pointer;
    trim_pointer_4.setAttribute("data-type","bottom-right");
    trim_pointer_4.style.setProperty("top" , imgSize.height + "px" , "");
    trim_pointer_4.style.setProperty("left"  , imgSize.width  + "px" , "");
    trim_relative.appendChild(trim_pointer_4);

  };

  // Preview Trim -----
  // TRIM.prototype.trim_pointer_target   = null;
  // TRIM.prototype.trim_pointer_position = null;
  // TRIM.prototype.trim_pointer_cursor   = null;
  // TRIM.prototype.trim_pointer_parent   = null;
  // TRIM.prototype.trim_pointer_imgSize  = null;
  // TRIM.prototype.trim_box = {
  //   target   : null,
  //   position : null,
  //   cursor   : null
  // };

  TRIM.prototype.trim_pointer_down = function(main,e,pagex,pagey){
    var main = main;
    var lib  = new LIB();
    var trim = this;
    var get  = new GET();

    var target = e.target;
    if(!target){return}
    // pointer
    if(target.className === main.options.dom.trim_pointer){
      main.options.trim_pointer_target   = target;
      main.options.trim_pointer_position = {x:target.offsetLeft , y:target.offsetTop};
      main.options.trim_pointer_cursor   = {x:pagex , y:pagey}
      main.options.trim_pointer_parent   = lib.upperSelector(target , ["."+main.options.dom.li]);
      var img = main.options.trim_pointer_parent.querySelector("."+main.options.dom.img);
      main.options.trim_pointer_imgSize  = get.getImageSize(img);
      target.setAttribute("data-target","1");
    }

    // trim-box
    else if(target.className === main.options.dom.trim_box){
      main.options.trim_box.target   = target;
      main.options.trim_box.position = {x:target.offsetLeft , y:target.offsetTop};
      main.options.trim_box.cursor   = {x:pagex , y:pagey}
    }
    
  };

  TRIM.prototype.trim_pointer_move = function(main,e,pagex,pagey){
    var main = main;
    var trim = this;

    // pointer
    if(main.options.trim_pointer_target
    && main.options.trim_pointer_imgSize
    && main.options.trim_pointer_parent){
      e.preventDefault();
      trim.set_trim_pointer_target(main , main.options.trim_pointer_target , main.options.trim_pointer_parent , main.options.trim_pointer_imgSize , pagex , pagey);
    }

    // trim-box
    else if(main.options.trim_box.target){
      e.preventDefault();
      trim.set_trim_box_control(main , pagex , pagey);
    }
  }

  TRIM.prototype.set_trim_pointer_target = function(main , target , parent , imgSize , px , py){
    var main = main;
    var lib  = new LIB();
    var trim = this;

    var x = main.options.trim_pointer_position.x - (main.options.trim_pointer_cursor.x - px);
    var y = main.options.trim_pointer_position.y - (main.options.trim_pointer_cursor.y - py);
    var rotate = parent.querySelector("."+main.options.dom.img).getAttribute("data-rotate");

    // areaチェック

    // 縦長
    var img_area = parent.querySelector("."+main.options.dom.img_area);
    if(trim.checkRotate(img_area.getAttribute("data-orientation") , rotate)){
      x = (x > 0) ? x : 0;
      x = (x < imgSize.height) ? x : imgSize.height;
      y = (y > 0) ? y : 0;
      y = (y < imgSize.width) ? y : imgSize.width;
    }
    // 横長
    else{
      x = (x > 0) ? x : 0;
      x = (x < imgSize.width) ? x : imgSize.width;
      y = (y > 0) ? y : 0;
      y = (y < imgSize.height) ? y : imgSize.height;
    }

    // pointer-collision
    var pos = trim.check_trim_pointer_cpllision(main , target,parent,x,y);
    
    
    target.style.setProperty("top"  , pos.y + "px" , "");
    target.style.setProperty("left" , pos.x + "px" , "");

    // interlocking
    var parent = lib.upperSelector(target , ["."+main.options.dom.li]);
    trim.set_trim_popinter_interlocking(main , target , parent , pos.x , pos.y);
    trim.set_trim_popinter_area(main , parent);
  };

  TRIM.prototype.check_trim_pointer_cpllision = function(main , target , parent ,x ,y){
    var tl = parent.querySelector("[data-type='top-left'");
    var tr = parent.querySelector("[data-type='top-right'");
    var bl = parent.querySelector("[data-type='bottom-left'");
    var br = parent.querySelector("[data-type='bottom-right'");
    switch(target.getAttribute("data-type")){
      case "top-left":
        x = (x < tr.offsetLeft) ? x : tr.offsetLeft;
        y = (y < bl.offsetTop)  ? y : bl.offsetTop;
        break;

      case "top-right":
        x = (x > tl.offsetLeft) ? x : tl.offsetLeft;
        y = (y < br.offsetTop)  ? y : br.offsetTop;
        break;

      case "bottom-left":
        x = (x < br.offsetLeft) ? x : br.offsetLeft;
        y = (y > tl.offsetTop)  ? y : tl.offsetTop;
        break;

      case "bottom-right":
        x = (x > bl.offsetLeft) ? x : bl.offsetLeft;
        y = (y > tr.offsetTop)  ? y : tr.offsetTop;
        break;
    }
    return {x : x , y : y};
  };

  TRIM.prototype.set_trim_popinter_interlocking = function(main , target , parent , x , y){
    var type = target.getAttribute("data-type");
    switch(type){
      case "top-left":
        var elm_x = parent.querySelector("[data-type='bottom-left']");
        var elm_y = parent.querySelector("[data-type='top-right']");
        break;
      case "top-right":
        var elm_x = parent.querySelector("[data-type='bottom-right']");
        var elm_y = parent.querySelector("[data-type='top-left']");
        break;
      case "bottom-left":
        var elm_x = parent.querySelector("[data-type='top-left']");
        var elm_y = parent.querySelector("[data-type='bottom-right']");
        break;
      case "bottom-right":
        var elm_x = parent.querySelector("[data-type='top-right']");
        var elm_y = parent.querySelector("[data-type='bottom-left']");
        break;
    }
    if(!elm_x || !elm_y){return;}
    elm_x.style.setProperty("left" , x + "px" , "");
    elm_y.style.setProperty("top"  , y + "px" , "");
  };

  TRIM.prototype.set_trim_popinter_area = function(main , parent){
    var trim = this;

    var box = parent.querySelector("."+main.options.dom.trim_box);
    if(!box){return}

    var top_left     = parent.querySelector("[data-type='top-left']");
    var top_right    = parent.querySelector("[data-type='top-right']");
    var bottom_left  = parent.querySelector("[data-type='bottom-left']");

    var left   = top_left.offsetLeft;
    var top    = top_left.offsetTop;
    var width  = (top_right.offsetLeft  - top_left.offsetLeft);
    var height = (bottom_left.offsetTop - top_left.offsetTop);

    box.style.setProperty("left"   , left + "px" , "");
    box.style.setProperty("top"    , top  + "px" , "");
    box.style.setProperty("width"  , width + "px" , "");
    box.style.setProperty("height" , height + "px" , "");

    trim.setAttribute_trimSize(main , parent , {
      left   : left,
      top    : top,
      width  : width,
      height : height
    });
  };

  TRIM.prototype.setAttribute_trimSize = function(main , pic , viewSize){
    if(!pic || !viewSize){return;}
    var main = main;
    var view = new VIEW();
    
    var area = pic.querySelector("."+main.options.dom.trim_area);
    if(area.getAttribute("data-visible") !== "1"){return;}

    var box  = pic.querySelector("."+main.options.dom.trim_box);
    var img  = pic.querySelector("."+main.options.dom.img);
    var w = Number(img.getAttribute("data-width"));
    var h = Number(img.getAttribute("data-height"));
    var rate = (w > h) ? area.offsetWidth / w : area.offsetHeight / h;

    img.setAttribute("data-trim-width"  , Math.floor(box.offsetWidth  / rate));
    img.setAttribute("data-trim-height" , Math.floor(box.offsetHeight / rate));

    img.setAttribute("data-trim-x"      , Math.floor(box.offsetLeft   / rate));
    img.setAttribute("data-trim-y"      , Math.floor(box.offsetTop    / rate));

    view.setInfo(main , pic.getAttribute("data-num") , img);
  };

  // trim処理の終了処理
  TRIM.prototype.trim_pointer_up = function(main,e,pagex,pagey){
    // pointer
    if(main.options.trim_pointer_target
    && main.options.trim_pointer_imgSize
    && main.options.trim_pointer_parent){
      main.options.trim_pointer_target.removeAttribute("data-target");
      main.options.trim_pointer_target = null;
      main.options.trim_pointer_position = null;
      main.options.trim_pointer_cursor = null;
      main.options.trim_pointer_imgSize  = null;
      main.options.trim_pointer_parent = null;
    }
    
    // box
    else if(main.options.trim_box.target
    && main.options.trim_box.position
    && main.options.trim_box.cursor){
      main.options.trim_box = {
        target   : null,
        position : null,
        cursor   : null
      };
    }
  }

  // rotateの際のtrim-pointerの移動処理
  TRIM.prototype.setTrimRotate_reset = function(main , parent , afterRotate){
    var main = main;
    var trim = this;
    var get  = new GET();

    var img = parent.querySelector("."+main.options.dom.img);
    if(!img){return;}
    var imgSize = get.getImageSize(img);
    if(!imgSize){return}
    // var borderMargin = 2*2;

    // relative
    var trim_relative = parent.querySelector("."+main.options.dom.trim_relative);
    trim.setElementStyle_relative(main , trim_relative , img);

    var top_left     = parent.querySelector("[data-type='top-left']");
    var top_right    = parent.querySelector("[data-type='top-right']");
    var bottom_left  = parent.querySelector("[data-type='bottom-left']");
    var bottom_right = parent.querySelector("[data-type='bottom-right']");

    // 回転値
    var img_area = parent.querySelector("."+main.options.dom.img_area);
    // if(afterRotate == 90 || afterRotate == 270){
    if(trim.checkRotate(img_area.getAttribute("data-orientation") , afterRotate)){
      top_left.style.setProperty("left"     , "0px" , "");
      top_left.style.setProperty("top"      , "0px" , "");
      top_right.style.setProperty("left"    , imgSize.height + "px" , "");
      top_right.style.setProperty("top"     , "0px" , "");
      bottom_left.style.setProperty("left"  , "0px" , "");
      bottom_left.style.setProperty("top"   , imgSize.width  + "px" , "");
      bottom_right.style.setProperty("left" , imgSize.height + "px" , "");
      bottom_right.style.setProperty("top"  , imgSize.width  + "px" , "");
    }

    // 正常値
    else{
      top_left.style.setProperty("left"     , "0px" , "");
      top_left.style.setProperty("top"      , "0px" , "");
      top_right.style.setProperty("left"    , imgSize.width  + "px" , "");
      top_right.style.setProperty("top"     , "0px" , "");
      bottom_left.style.setProperty("left"  , "0px" , "");
      bottom_left.style.setProperty("top"   , imgSize.height + "px" , "");
      bottom_right.style.setProperty("left" , imgSize.width  + "px" , "");
      bottom_right.style.setProperty("top"  , imgSize.height + "px" , "");
    }
    
    trim.set_trim_popinter_area(main , parent);
  }

  // orientation + rotate = roll-value
  TRIM.prototype.checkRotate = function(orientation , rotate){
    orientation = (orientation) ? orientation : 0;
    rotate      = (rotate)      ? rotate      : 0;

    // rotate=on
    if(orientation == 6 || orientation == 8){
      if(rotate == 90 || rotate == 270){
        return false;;
      }
      else{
        return true;
      }
    }
    // rotate=off
    else{
      if(rotate == 90 || rotate == 270){
        return true;
      }
      else{
        return false;
      }
    }
  };


  TRIM.prototype.setElementStyle_relative = function(main , trim_relative , img){
    var main = main;
    var lib  = new LIB();
    var get  = new GET();
    var trim = this;

    var rotate = img.getAttribute("data-rotate");

    var w = Number(img.getAttribute("data-width"));
    var h = Number(img.getAttribute("data-height"));
    var imgSize = get.getImageSize(img);

    // 回転：横
    // if(rotate == 90 || rotate == 270){
    var img_area = lib.upperSelector(img , ["."+main.options.dom.img_area]);
    if(trim.checkRotate(img_area.getAttribute("data-orientation") , rotate)){
      trim_relative.style.setProperty("top"    , imgSize.left +"px" , "");
      trim_relative.style.setProperty("left"   , imgSize.top +"px" , "");
  
      if(w > h){
        trim_relative.style.setProperty("width"  , imgSize.height +"px" , "");
        trim_relative.style.setProperty("height" , "100%" , "");
      }
      else{
        trim_relative.style.setProperty("width"  , "100%" , "");
        trim_relative.style.setProperty("height" , imgSize.width +"px" , "");
      }
    }
    // 回転 : 正常
    else{
      trim_relative.style.setProperty("top"    , imgSize.top +"px" , "");
      trim_relative.style.setProperty("left"   , imgSize.left +"px" , "");
  
      if(w > h){
        trim_relative.style.setProperty("width"  , "100%" , "");
        trim_relative.style.setProperty("height" , imgSize.height +"px" , "");
      }
      else{
        trim_relative.style.setProperty("width"  , imgSize.width +"px" , "");
        trim_relative.style.setProperty("height" , "100%" , "");
      }
    }
  };

  TRIM.prototype.set_trim_box_control = function(main , px,py){
    var target = main.options.trim_box.target;
    if(!target){return}
    var x = main.options.trim_box.position.x - (main.options.trim_box.cursor.x - px);
    var y = main.options.trim_box.position.y - (main.options.trim_box.cursor.y - py);
    x = (x < 0) ? 0 : x;
    y = (y < 0) ? 0 : y;
    x = (x + target.offsetWidth  > target.parentNode.offsetWidth)  ? target.parentNode.offsetWidth  - target.offsetWidth  : x;
    y = (y + target.offsetHeight > target.parentNode.offsetHeight) ? target.parentNode.offsetHeight - target.offsetHeight : y;
    target.style.setProperty("left" , x + "px" , "");
    target.style.setProperty("top"  , y + "px" , "");

    // pointer
    var parent       = target.parentNode;
    var top_left     = parent.querySelector("[data-type='top-left']");
    var top_right    = parent.querySelector("[data-type='top-right']");
    var bottom_left  = parent.querySelector("[data-type='bottom-left']");
    var bottom_right = parent.querySelector("[data-type='bottom-right']");

    top_left.style.setProperty("top"   , y + "px","");
    top_left.style.setProperty("left"  , x + "px","");
    top_right.style.setProperty("top"  , y + "px","");
    top_right.style.setProperty("left" , (x + target.offsetWidth) + "px","");
    bottom_left.style.setProperty("top"   , (y + target.offsetHeight) + "px","");
    bottom_left.style.setProperty("left"  , x + "px","");
    bottom_right.style.setProperty("top"  , (y + target.offsetHeight) + "px","");
    bottom_right.style.setProperty("left" , (x + target.offsetWidth) + "px","");
  }

  // // 回転の前後で何度回転したかを算出(0->270:-90 , 180->270:)
  // VIEW.prototype.checkRotateDeg = function(beforeRotate , afterRotate){
  //   var main = this;

  //   var diff = afterRotate - beforeRotate;
  //   // 左回転
  //   diff = (diff >  180) ? beforeRotate - afterRotate + 180 : diff;
  //   // 右回転
  //   diff = (diff < -180) ? beforeRotate - afterRotate + 180 : diff;
  //   return diff;
  // };

  

  
  return MAIN;
})();
