;$$fileupload = (function(){

  // 起動scriptタグを選択
  var __currentScriptTag = (function(){
    var scripts = document.getElementsByTagName("script");
    return __currentScriptTag = scripts[scripts.length-1].src;
  })();

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

  var __options = {
    id            : null, // インスタンス（送信用とする）識別子 : システム利用用（設定不可）
    count         : null, // 送信する画像の総合枚数（送信ボタンを押すと確定） : システム利用用（設定不可）
    cacheTime     : null, // システム利用用（設定不可）
    currentPath   : null, // システム利用用（設定不可）

    btn_selector  : "#fileupload", // クリックするボタンのselectors（複数対応）

    // 画像アップロード前のプレビュー用
    css_path      : null, // 表示系cssの任意指定（デフォルト(null)は起動スクリプトと同一階層）
    file_multi    : true, // 複数ファイルアップロード対応 [ true : 複数  , false : 1つのみ]
    view_bg_class : "fileUpload-image-bg", // 画像編集用モードのBG(base)要素のclass名
    extensions    : ["jpg","jpeg","png","gif","svg"], // 指定拡張子一覧（必要なもののみセット可能）
    img_rotate_button : null, // 画像編集の回転機能アイコン（デフォルト(null)は起動スクリプトと同一階層）
    img_delete_button : null, // 画像編集の削除機能アイコン（デフォルト(null)は起動スクリプトと同一階層）

    querys        : {},   // input type="hidden"の任意値のセット(cgiに送信する際の各種データ)

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
    if(!head){return;}
    var css  = document.createElement("link");
    css.rel  = "stylesheet";
    css.href = (this.options.css_path !== null) ? this.options.css_path : this.options.currentPath + "images.css";
    head[0].appendChild(css);
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

  // 処理用iframe内のform内のtype=fileを取得
  $$.prototype.getForm_typeFile = function(){
    return document.querySelector("input[name='fileupload_"+ this.options.cacheTime +"']");
  };

  // 編集画面の画像一覧リストの取得
  $$.prototype.getEditImageLists = function(){
    return document.querySelectorAll("."+this.options.view_bg_class+" ul li.pic");
  };

  $$.prototype.setTypeFile = function(){
    var inp      = document.createElement("input");
		inp.type     = "file";
    inp.name     = "fileupload_" + this.options.cacheTime;
    inp.multiple = (this.options.file_multi) ? "multiple" : "";
    inp.style.setProperty("display","none","");
    inp.accept   = "image/gif,image/jpeg,image/png";

    __event(inp , "change" , (function(e){
      if(typeof this.options.file_select === "function" && __checkFileAPI()){
        var input = e.currentTarget;
        this.viewImageEdit(input);

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
  $$.prototype.viewImageEdit = function(targetInputForm){
    this.viewBG();
    this.viewImages(targetInputForm);

    // システムデータ保持
    this.options.id = Math.floor((+new Date())/1000);
    this.options.count = targetInputForm.files.length;
// console.log(this.options.id+"/"+this.options.count);
  };

  // [画像編集] 画像回転処理


  // [画像編集] 編集画面表示（複数画像対応）
  $$.prototype.viewImages = function(filesElement){

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
      img.src = path;
      img.className = "picture";
      img.setAttribute("data-num"  , i);
      __event(img , "load" , (function(e){this.loadedImage(e)}).bind(this));
      li.appendChild(img);

      var num = document.createElement("div");
      num.className = "num";
      li.appendChild(num);

      var control = document.createElement("div");
      control.className = "control";
      control.setAttribute("data-num" , i);
      li.appendChild(control);
      

      var rotateImage = new Image();
      rotateImage.className = "rotate";
      rotateImage.src = (this.options.img_rotate_button !== null) ? this.options.img_rotate_button : this.options.currentPath + "rotate.svg";
      control.appendChild(rotateImage);
      __event(rotateImage , "click" , (function(e){this.clickRotateButton(e)}).bind(this));

      var delImage = new Image();
      delImage.className = "delete";
      delImage.src = (this.options.img_delete_button !== null) ? this.options.img_delete_button : this.options.currentPath + "delete.svg";
      control.appendChild(delImage);
      __event(delImage , "click" , (function(e){this.clickDeleteButton(e)}).bind(this));

    }


    // submit,cancel-button
    var li = document.createElement("li");
    li.className = "submit";
    ul.appendChild(li);

    var sendButton = document.createElement("button");
    if(files.length > 1){
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
    uploading.className = "uploading";
    li.appendChild(uploading);
    for(var i=0; i<12;i++){
      var dot = document.createElement("div");
      dot.className = "dot";
      uploading.appendChild(dot);
    }
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

    var targetImage = document.querySelector("."+this.options.view_bg_class+" ul li.pic[data-num='"+num+"'] img.picture");
    if(!targetImage){return;}

    var rotateNum = targetImage.getAttribute("data-rotate");
    rotateNum = (rotateNum) ? rotateNum : "0";

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

  };

  //
  $$.prototype.clickDeleteButton = function(e){
    if(!confirm("アップロードリストから写真を破棄しますか？※直接撮影された写真は保存されません。")){return;}

    var target = e.currentTarget;
    // console.log(target.parentNode.getAttribute("data-num"));
    var num = target.parentNode.getAttribute("data-num");
    if(num === null){return;}

    var targetListBase = document.querySelector("."+this.options.view_bg_class+" ul li.pic[data-num='"+num+"']");
    if(!targetListBase){return;}

    targetListBase.parentNode.removeChild(targetListBase);

    // ラスト１つを削除した場合は、キャンセル扱い
    var lists = this.getEditImageLists();
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

  // 画像を読み込んだ際のイベント処理
  $$.prototype.loadedImage = function(e){
    var img = e.currentTarget;
    var num = img.getAttribute("data-num");

    img.setAttribute("data-width" ,img.naturalWidth);
    img.setAttribute("data-height",img.naturalHeight);

    if(typeof window.EXIF !== "undefined"){
      var res = EXIF.getData(img , (function(img,e) {
        var exifData = EXIF.getAllTags(img);
        img.setAttribute("data-exif" , JSON.stringify(exifData));
      }).bind(this , img));
    }
  };

  $$.prototype.clickSendButton = function(e){
    var files = this.getForm_typeFile().files;
    var lists = this.getEditImageLists();
    for(var i=0; i<lists.length; i++){
      var num = lists[i].getAttribute("data-num");
      // this.postFile(files[num]);
      this.postFiles_cache.push(files[num]);
    }

    // uploading フラグ設置
    var submitArea = document.querySelector(".fileUpload-image-bg li.submit");
    if(submitArea){
      submitArea.setAttribute("data-uploading","1");
    }

    if(this.postFiles_cache.length > 0){
      this.postFile(lists[0]);
    }
  };

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
    fd.append("id"         , this.options.id);
    fd.append("num"        , (this.options.count - this.postFiles_cache.length));
    fd.append("imageFile"  , this.postFiles_cache[0]);
    fd.append("info[name]" , this.postFiles_cache[0].name);
    fd.append("info[size]" , this.postFiles_cache[0].size);
    fd.append("info[type]" , this.postFiles_cache[0].type);
    fd.append("info[modi]" , this.postFiles_cache[0].lastModified);
    fd.append("info[date]" , this.postFiles_cache[0].lastModifiedDate);
    
    var img = viewListElement.querySelector(".picture");
    var rotate = (img.getAttribute("data-rotate")) ? img.getAttribute("data-rotate") : "";
    fd.append("info[rotate]" , rotate);
    fd.append("info[width]"  , img.getAttribute("data-width"));
    fd.append("info[height]" , img.getAttribute("data-height"));

    var lists = this.getEditImageLists();
    if(!lists.length){return;}

    var img = lists[0].querySelector("img");
    var exifData = img.getAttribute("data-exif");
    if(exifData){
      fd.append("exif" , exifData);
    }

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

  $$.prototype.post_success = function(){

    // メモリしてあるファイル一覧から送信済みを削除
    if(this.postFiles_cache.length){
      this.postFiles_cache.shift();
    }

    // 表示一覧から送信済みを削除
    var lists = this.getEditImageLists();
    if(lists.length){
      lists[0].parentNode.removeChild(lists[0]);
    }

    // 送信後の削除処理をした直後のエレメント一覧の取得
    var lists = this.getEditImageLists();

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


  
  return $$;

})();
