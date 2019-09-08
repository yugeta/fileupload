;$$fileupload = (function(){

  // [共通関数] イベントセット
	var __event = function(target, mode, func){
		if (target.addEventListener){target.addEventListener(mode, func, false)}
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

  // [共通関数] JS読み込み時の実行タイミング処理（body読み込み後にJS実行する場合に使用）
	var __construct = function(){
    switch(document.readyState){
      case "complete"    : new $$;break;
      case "interactive" : __event(window , "DOMContentLoaded" , function(){new $$});break;
      default            : __event(window , "load" , function(){new $$});break;
		}
  };

  // ----------

  // インスタンスベースモジュール（初期設定処理）
  var $$ = function(options){

    this.replaceOptions(options);

    // set-css
    this.setCss();

    this.options.cacheTime = (+new Date());

    // make iframe
		var iframe = this.makeIframe();
    this.setIframeInner(iframe);

		// upload-button
		this.setButton(iframe);

  };

  $$.prototype.options = {
    cacheTime     : null,
    iframe_src    : "./null.html", // iframeの初期読み込みファイル(同一URL)
    btn_selector  : "#upload",     // クリックするボタンのselectors（複数対応）
    form_action   : "index.php",   // form送信先action値
    input_name    : "uploadFiles", // type=fileのname値(cgi)
    view_bg_class : "fileUpload-image-bg",            // 画像編集用モードのBG(base)要素のclass名
    css_path      : "mynt/lib/js/fileupload/images.css",
    file_multi    : true,          // 複数ファイルアップロード対応 [ true : 複数  , false : 1つのみ]
    extensions    : ["jpg","jpeg","png","gif","svg"], // 指定拡張子一覧
    hiddens       : {},            // input type="hidden"の任意値のセット(cgiに送信する際の各種データ)
    img_rotate_button : "mynt/lib/js/fileupload/rotate.svg",
    img_delete_button : "mynt/lib/js/fileupload/delete.svg",
    file_select   : function(e){console.log(e)}       // submit直前の任意イベント処理
  };

  // [初期設定] インスタンス引数を基本設定(options)と入れ替える
  $$.prototype.replaceOptions = function(options){
    for(var i in options){
      this.options[i] = options[i];
    }
    return this.options;
  };

  // [初期設定] 基本CSSセット
  $$.prototype.setCss = function(){
    var head = document.getElementsByTagName("head");
    if(!head){return;}
    var css  = document.createElement("link");
    css.rel  = "stylesheet";
    css.href = this.options.css_path;
    head[0].appendChild(css);
  };

  // [初期設定] iframeタグ作成処理
  $$.prototype.makeIframe = function(){
    var iframe = document.createElement("iframe");
    iframe.id  = "iframe_" + this.options.cacheTime;
    iframe.src = this.options.iframe_src;
    iframe.style.setProperty("display","none","");
    __event(iframe , "load" , (function(iframe,e){this.setIframeInner(iframe)}).bind(this,iframe));
    document.body.appendChild(iframe);
    return iframe;
  };

  $$.prototype.getBase = function(){
    var lists = document.getElementsByClassName(this.options.view_bg_class);
    if(lists.length){
      return lists[0];
    }
    else{
      return null;
    }
  };

  // 処理用iframeを取得
  $$.prototype.getIframe = function(){
    return document.getElementById("iframe_" + this.options.cacheTime);
  };

  // 処理用iframe内のフォームを取得
  $$.prototype.getForm = function(){
    return this.getIframe().contentWindow.document.body.querySelector("form[name='form_"+this.options.cacheTime+"']");
  };

  // 処理用iframe内のform内のtype=fileを取得
  $$.prototype.getForm_typeFile = function(){
    return this.getForm().querySelector("input[type='file']");
  };

  // 編集画面の画像一覧リストの取得
  $$.prototype.getEditImageLists = function(){
    return document.querySelectorAll(".fileUpload-image-bg ul li.pic");
  };

  // iframe内のDOMを構築（既存のDOMは破棄する）※iframeのonloadタイミングで実行
  $$.prototype.setIframeInner = function(iframe){
    var form     = document.createElement("form");
		form.name    = "form_" + this.options.cacheTime;
		form.method  = "POST";
		form.enctype = "multipart/form-data";
    form.action  = this.options.form_action;
    
    var inp      = document.createElement("input");
		inp.type     = "file";
    inp.name     = this.options.input_name;
    if(this.options.file_multi){
      inp.multiple = "multiple";
    }
    
    __event(inp , "change" , (function(iframe,e){
      if(typeof this.options.file_select === "function" && __checkFileAPI()){
        var input = e.currentTarget;
        this.viewImageEdit(input);
      }
      else{
        var form = this.getForm();
        form.submit();
      }
    }).bind(this,iframe));
    form.appendChild(inp);
    
    for(var i in this.options.hiddens){
      var inp     = document.createElement("input");
      inp.type    = "hidden";
      inp.name    = i;
      inp.value   = this.options.hiddens[i];
      form.appendChild(inp);
    }
    iframe.contentWindow.document.body.innerHTML = "";
    iframe.contentWindow.document.body.appendChild(form);
  };
  
  // [初期設定] データ送信ボタンのsubmit処理設定（複数対応）
  $$.prototype.setButton = function(iframe){
    var btns = document.querySelectorAll(this.options.btn_selector);
    for(var i=0; i<btns.length; i++){
      __event(btns[i] , "click" , (function(e){this.clickFileButton(e, iframe)}).bind(this , iframe));
    }
  };

  // データ送信submitボタンクリック時の処理
  $$.prototype.clickFileButton = function(iframe , e){
    if(!iframe
    || !iframe.contentWindow
    || !iframe.contentWindow.document.body){
      console.log("Error ! (not iframe.)");
      return;
    }

    var typeFile = this.getForm_typeFile();
    typeFile.click();
  };


  // postデータの拡張子確認
  $$.prototype.checkExtension = function(filename){

  };


  // [画像編集] 送信前の画像編集操作処理
  $$.prototype.viewImageEdit = function(targetInputForm){
    this.viewBG();
    this.viewImages(targetInputForm);

  };

  // [画像編集] 画像回転処理


  // [画像編集] 編集画面表示（複数画像対応）
  $$.prototype.viewImages = function(filesElement){

    // var filesElement = this.getForm_typeFile();
    if(!filesElement){return;}

    var files = filesElement.files;
    if(!files || !files.length){return;}


    var bgs = document.getElementsByClassName(this.options.view_bg_class);
    if(!bgs || !bgs.length){return;}
    var bg = bgs[0];

    var ul = document.createElement("ul");
    bg.appendChild(ul);

    for(var i=0; i<files.length; i++){
      var li = document.createElement("li");
      li.className = "pic";
      li.setAttribute("data-num" , i);
      ul.appendChild(li);

      var path = URL.createObjectURL(files[i]);

      var img = new Image();
      // var img = document.createElement("img");
      img.src = path;
      img.className = "picture";
      img.setAttribute("data-num"  , i);
      // img.setAttribute("data-name" , files[i].name);
      // img.setAttribute("data-size" , files[i].size);
      // img.setAttribute("data-type" , files[i].type);
      // img.setAttribute("data-last" , files[i].lastModifiedDate);
      __event(img , "load" , (function(e){this.loadedImage(e)}).bind(this));
      // __event(img , "load" , this.loadedImage);
      li.appendChild(img);

      var num = document.createElement("div");
      num.className = "num";
      // num.textContent = (i+1);
      li.appendChild(num);

      var control = document.createElement("div");
      control.className = "control";
      control.setAttribute("data-num" , i);
      li.appendChild(control);
      
      var rotateImage = new Image();
      rotateImage.className = "rotate";
      rotateImage.src = this.options.img_rotate_button;
      control.appendChild(rotateImage);
      __event(rotateImage , "click" , (function(e){this.clickRotateButton(e)}).bind(this));

      var delImage = new Image();
      delImage.className = "delete";
      delImage.src = this.options.img_delete_button;
      control.appendChild(delImage);
      __event(delImage , "click" , (function(e){this.clickDeleteButton(e)}).bind(this));

    }

    var li = document.createElement("li");
    li.className = "submit";
    ul.appendChild(li);

    var sendButton = document.createElement("button");
    sendButton.innerHTML = "送信";
    __event(sendButton , "click" , (function(e){this.clickSendButton(e)}).bind(this));
    li.appendChild(sendButton);

    var cancelButton = document.createElement("button");
    cancelButton.innerHTML = "キャンセル";
    __event(cancelButton , "click" , (function(e){this.clickCancel(e)}).bind(this));
    li.appendChild(cancelButton);
  };

  // [画像編集] BG表示
  $$.prototype.viewBG = function(){
    var bg = document.createElement("div");
    bg.className = this.options.view_bg_class;
    document.body.appendChild(bg);
  };

  // [画像編集] rotateボタンを押した時の処理（左に90度回転）
  $$.prototype.clickRotateButton = function(e){
    var target = e.currentTarget;
    // console.log(target.parentNode.getAttribute("data-num"));
    var num = target.parentNode.getAttribute("data-num");
    if(num === null){return;}

    var targetListBase = document.querySelector(".fileUpload-image-bg ul li.pic[data-num='"+num+"']");
    if(!targetListBase){return;}

    var rotateNum = targetListBase.getAttribute("data-rotate");
    rotateNum = (rotateNum) ? rotateNum : "0";


  };

  //
  $$.prototype.clickDeleteButton = function(e){
    if(!confirm("アップロードリストから写真を破棄しますか？※直接撮影された写真は保存されません。")){return;}

    var target = e.currentTarget;
    // console.log(target.parentNode.getAttribute("data-num"));
    var num = target.parentNode.getAttribute("data-num");
    if(num === null){return;}

    var targetListBase = document.querySelector(".fileUpload-image-bg ul li.pic[data-num='"+num+"']");
    if(!targetListBase){return;}

    targetListBase.parentNode.removeChild(targetListBase);

    // ラスト１つを削除した場合は、キャンセル扱い
    var lists = this.getEditImageLists();
    if(!lists || !lists.length){
      this.clickCancel();
    }
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

  // 画像を読み込んだ際のイベント処理
  $$.prototype.loadedImage = function(e){
    var img = e.currentTarget;
    var num = img.getAttribute("data-num");
    var res = EXIF.getData(img , (function(img,e) {
// console.log(img);
      // var num  = img.getAttribute("data-num");
      // var name = img.getAttribute("data-name");
      // var size = img.getAttribute("data-size");
      // var type = img.getAttribute("data-type");
      // var last = new $$date().getDate_ymdhis(img.getAttribute("data-last"));
      // console.log("num  : " + num);
      // console.log("name : " + name);
      // console.log("size : " + size);
      // console.log("type : " + type);
      // console.log(last);
      // console.log("Width.height : "+ img.naturalWidth + " / " + img.naturalHeight);
      // console.log("src : " + img.src);
      
      // var ajax = new $$mynt_ajax().lastModified(img.src , function(res){console.log(res)});

      var exifData = EXIF.getAllTags(img);
// console.log(exifData);
      img.setAttribute("data-exif" , JSON.stringify(exifData));
      // $$.prototype.createImageOnCanvas(this , exif);
      // console.log(exif);

    }).bind(this , img));
    // console.log(res);
    // var res = EXIF.getAllTags(this);
    // console.log(res);
  };

  $$.prototype.clickSendButton = function(e){
    var files = this.getForm_typeFile().files;
    var lists = this.getEditImageLists();
    for(var i=0; i<lists.length; i++){
      var num = lists[i].getAttribute("data-num");
      // this.postFile(files[num]);
      this.postFiles_cache.push(files[num]);
    }
    if(this.postFiles_cache.length > 0){
      this.postFile();
    }
  };

  $$.prototype.postFiles_cache = [];
  $$.prototype.postFile = function(){

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

    // var lists = this.getEditImageLists();
    // var files = this.getForm_typeFile().files;
    // var form  = this.getForm();
    // var fd    = new FormData(form);

    var fd   = new FormData();
    fd.append("php" , "\\mynt\\service\\fileupload::test()");
    // var path = URL.createObjectURL(files[0]);
    // for(var i=0; i<lists.length; i++){
    //   this.postFiles.push(files[0]);
    // }
    fd.append("imageFile"  , this.postFiles_cache[0]);
    fd.append("data[name]" , this.postFiles_cache[0].name);
    fd.append("data[size]" , this.postFiles_cache[0].size);
    fd.append("data[type]" , this.postFiles_cache[0].type);
    fd.append("data[modi]" , this.postFiles_cache[0].lastModified);
    fd.append("data[date]" , this.postFiles_cache[0].lastModifiedDate);
    var lists = this.getEditImageLists();
    var img = lists[0].querySelector("img");
    var exifData = img.getAttribute("data-exif");
    // var exifData = EXIF.getAllTags(img);
    if(exifData){
// console.log(exifData);
      fd.append("exif" , exifData);
    }


    // fd.append("aaa" , "AAA");
    // fd.append("ccc" , "CCC");
// console.log(fd.keys());
// for(var i of fd.keys()){
//   console.log(i);
// }

    // new $$ajax({
    //   // "url"    : "test.php?bb=BBB",
    //   "url"    : location.href,
    //   "type"   : "",
    //   "form"   : fd,
    //   onSuccess : function(res){
    //     console.log(res);
    //   }
    // });

    var XHR = new XMLHttpRequest();
    XHR.onreadystatechange = (function(XHR,e){
			if (XHR.readyState==4 && XHR.status == 200){
        console.log(XHR.responseText);
        if(this.postFiles_cache.length){
          this.postFiles_cache.shift();
        }
        var lists = this.getEditImageLists();
        if(lists.length){
          lists[0].parentNode.removeChild(lists[0]);
        }
        this.postFile();
			}
		}).bind(this,XHR);
    XHR.open('POST', location.href);
    XHR.send(fd);

  };
  




  // __construct();
  
  return $$;

})();
