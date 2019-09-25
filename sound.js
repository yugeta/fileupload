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
    // extensions    : ["jpg","jpeg","png","gif","svg"], // 指定拡張子一覧（必要なもののみセット可能）
    contentTypes  : ["audio/mpeg"], // mp3
    img_rotate_button : null, // 画像編集の回転機能アイコン（デフォルト(null)は起動スクリプトと同一階層）
    img_delete_button : null, // 画像編集の削除機能アイコン（デフォルト(null)は起動スクリプトと同一階層）
    img_trim_button   : null,

    querys        : {},   // input type="hidden"の任意値のセット(cgiに送信する際の各種データ)

    // dom構造(className)
    dom:{
      base : "fileUpload-base",
        ul : "",
          li : "pic",
            img_area : "img-area",
              img     : "picture",
            info    : "info",
              info_pixel : "info-pixel",
              info_size  : "info-size",
              info_type  : "info-type",
            control : "control",
              rotate : "rotate",
              trim   : "trim",
              delete : "delete",
            trim_area : "trim-area",
              trim_relative : "trim-relative",
                trim_box     : "trim-box",
                trim_pointer : "trim-pointer",
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
    
    this.setTypeFile();

		// upload-button
    this.setButton();
    
    // event
    __event(window , "mousedown" , (function(e){this.trim_pointer_down(e , e.pageX , e.pageY)}).bind(this));
    __event(window , "mousemove" , (function(e){this.trim_pointer_move(e , e.pageX , e.pageY)}).bind(this));
    __event(window , "mouseup"   , (function(e){this.trim_pointer_up(e , e.pageX , e.pageY)}).bind(this));

    __event(window , "touchstart" , (function(e){this.trim_pointer_down(e , e.changedTouches[0].pageX , e.changedTouches[0].pageY)}).bind(this) , {passive:false});
    __event(window , "touchmove"  , (function(e){this.trim_pointer_move(e , e.changedTouches[0].pageX , e.changedTouches[0].pageY)}).bind(this) , {passive:false});
    __event(window , "touchend"   , (function(e){this.trim_pointer_up(e , e.changedTouches[0].pageX , e.changedTouches[0].pageY)}).bind(this) , {passive:false});

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
    css.href = (this.options.css_path !== null) ? this.options.css_path : this.options.currentPath + "sound.css";
    head[0].appendChild(css);
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
  $$.prototype.getEditImageLists = function(){
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
        this.viewImageEdit(input);
        this.options.file_select(e , this.options);
      }
    }).bind(this));
    document.body.appendChild(inp);

  };

  $$.prototype.convert_extension2contenType = function(extension){
    switch(extension){
      case "jpg":
      case "jpeg":
      break;
      case "png":
      break;
      case "gif":
      break;
      case "mp3":
      break;
    }
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
  };


  // [画像編集] 編集画面表示（複数画像対応）
  $$.prototype.viewImages = function(filesElement){

    if(!filesElement){return;}

    var files = filesElement.files;
    if(!files || !files.length){return;}

    var bgs = document.getElementsByClassName(this.options.dom.base);
    if(!bgs || !bgs.length){return;}
    var bg = bgs[0];

    var ul = document.createElement("ul");
    bg.appendChild(ul);

    for(var i=0; i<files.length; i++){
      var li = this.setImagePreview(files[i] , i);
      ul.appendChild(li);
    }

    // submit,cancel-button
    var file_count = files.length;
    var li = this.setControlButtons(file_count);
    ul.appendChild(li);
  };


  // プレビュー表示の写真表示箇所のエレメントセット
  $$.prototype.setImagePreview = function(fl,i){
    var li = document.createElement("li");
    li.className = this.options.dom.li;
    li.setAttribute("data-num" , i);

    var path = URL.createObjectURL(fl);

    var img_area = document.createElement("div");
    img_area.className = this.options.dom.img_area;
    li.appendChild(img_area);

    var img = new Image();
    img.src = path;
    img.className = this.options.dom.img;
    img.setAttribute("data-num"    , i);
    img.setAttribute("data-type"   , fl.type);
    img.setAttribute("data-size"   , fl.size);
    __event(img , "load" , (function(e){
      this.loadedImage(e);
      this.setTrimPreview(e.target);

      // set-info
      var parent = __upperSelector(e.target , ["."+this.options.dom.li]);
      if(!parent){return;}
      var pid = parent.getAttribute("data-num");
      this.setInfo(pid , e.target);
    }).bind(this));
    img_area.appendChild(img);

    var info = document.createElement("div");
    info.className = this.options.dom.info;
    li.appendChild(info);
    var info_pixel = document.createElement("div");
    info_pixel.className = this.options.dom.info_pixel;
    info.appendChild(info_pixel);
    var info_type = document.createElement("div");
    info_type.className = this.options.dom.info_type;
    info.appendChild(info_type);
    var info_size = document.createElement("div");
    info_size.className = this.options.dom.info_size;
    info.appendChild(info_size);


    var control = document.createElement("div");
    control.className = this.options.dom.control;
    control.setAttribute("data-num" , i);
    li.appendChild(control);
    

    var rotateImage = new Image();
    rotateImage.className = this.options.dom.rotate;
    rotateImage.src = (this.options.img_rotate_button !== null) ? this.options.img_rotate_button : this.options.currentPath + "rotate.svg";
    control.appendChild(rotateImage);
    __event(rotateImage , "click" , (function(e){this.clickRotateButton(e)}).bind(this));

    var delImage = new Image();
    delImage.className = this.options.dom.delete;
    delImage.src = (this.options.img_delete_button !== null) ? this.options.img_delete_button : this.options.currentPath + "delete.svg";
    control.appendChild(delImage);
    __event(delImage , "click" , (function(e){this.clickDeleteButton(e)}).bind(this));

    var trimImage = new Image();
    trimImage.className = this.options.dom.trim;
    trimImage.src = (this.options.img_trim_button !== null) ? this.options.img_trim_button : this.options.currentPath + "crop.svg";
    control.appendChild(trimImage);
    __event(trimImage , "click" , (function(e){this.clickTrimButton(e)}).bind(this));

    return li;
  };

  // trim-control
  $$.prototype.setTrimPreview = function(img){

    // var border_size = 2 * 2;
    // var w = img.getAttribute("data-width");
    // var h = img.getAttribute("data-height");

    var imgSize = this.getImageSize(img);
    if(!imgSize){return}
    var li = __upperSelector(img , ["."+this.options.dom.li]);

    var trim_elm = li.querySelector("."+this.options.dom.trim_area);
    if(trim_elm){
      trim_elm.parentNode.removeChild(trim_elm);
    }

    // area + relative
    var trim_area = document.createElement("div");
    trim_area.className = this.options.dom.trim_area;
    li.appendChild(trim_area);

    var trim_relative = document.createElement("div");
    trim_relative.className = this.options.dom.trim_relative;
    this.setElementStyle_relative(trim_relative , img);
    trim_area.appendChild(trim_relative);


    // pointer-area
    var trim_box = document.createElement("div");
    trim_box.className = this.options.dom.trim_box;
    trim_box.style.setProperty("top"    , "0px"  , "");
    trim_box.style.setProperty("bottom" , "0px"  , "");
    trim_box.style.setProperty("left"   , "0px"  , "");
    trim_box.style.setProperty("right"  , "0px"  , "");
    trim_relative.appendChild(trim_box);

//     var roll = 0;
    var img_area = li.querySelector("."+this.options.dom.img_area);
// console.log(img_area);
//     if(this.checkRotate(img_area.getAttribute("data-orientation") , img.getAttribute("data-rotate"))){
//       roll = 1;
//     }
// console.log(img_area.getAttribute("data-orientation") +"/"+ img.getAttribute("data-rotate"));
// console.log(roll);

    // pointer : top-left
    var trim_pointer_1 = document.createElement("div");
    trim_pointer_1.className = this.options.dom.trim_pointer;
    trim_pointer_1.setAttribute("data-type","top-left");
    // if(roll === 0){
      trim_pointer_1.style.setProperty("top"  , "0px" , "");
      trim_pointer_1.style.setProperty("left" , "0px" , "");
    // }
    // else{
    //   trim_pointer_1.style.setProperty("top"  , "0px" , "");
    //   trim_pointer_1.style.setProperty("left" , "0px" , "");
    // }
    trim_relative.appendChild(trim_pointer_1);

    // pointer : top-right
    var trim_pointer_2 = document.createElement("div");
    trim_pointer_2.className = this.options.dom.trim_pointer;
    trim_pointer_2.setAttribute("data-type","top-right");
    // if(roll === 0){
      trim_pointer_2.style.setProperty("top"  , "0px" , "");
      trim_pointer_2.style.setProperty("left" , imgSize.width + "px" , "");
    // }
    // else{
    //   trim_pointer_2.style.setProperty("top"  , "0px" , "");
    //   trim_pointer_2.style.setProperty("left" , imgSize.width + "px" , "");
    // }
    trim_relative.appendChild(trim_pointer_2);

    // pointer : bottom-left
    var trim_pointer_3 = document.createElement("div");
    trim_pointer_3.className = this.options.dom.trim_pointer;
    trim_pointer_3.setAttribute("data-type","bottom-left");
    // if(roll === 0){
      trim_pointer_3.style.setProperty("top"  , imgSize.height + "px" , "");
      trim_pointer_3.style.setProperty("left" , "0px" , "");
    // }
    // else{
    //   trim_pointer_3.style.setProperty("top"  , imgSize.height + "px" , "");
    //   trim_pointer_3.style.setProperty("left" , "0px" , "");
    // }
    trim_relative.appendChild(trim_pointer_3);

    // pointer : bottom-right
    var trim_pointer_4 = document.createElement("div");
    trim_pointer_4.className = this.options.dom.trim_pointer;
    trim_pointer_4.setAttribute("data-type","bottom-right");
    // if(roll === 0){
      trim_pointer_4.style.setProperty("top" , imgSize.height + "px" , "");
      trim_pointer_4.style.setProperty("left"  , imgSize.width  + "px" , "");
    // }
    // else{
    //   trim_pointer_4.style.setProperty("top" , imgSize.height + "px" , "");
    //   trim_pointer_4.style.setProperty("left"  , imgSize.width  + "px" , "");
    // }
    trim_relative.appendChild(trim_pointer_4);

  };

  $$.prototype.getImageSize = function(img){
    if(!img){return}

    // var img_area = __upperSelector(img , ["."+this.options.dom.img_area]);
    // var base = {};
    // if(this.checkRotate(img_area.getAttribute("data-orientation") , img.getAttribute("data-rotate"))){
    //   base = {
    //     w : Number(img.getAttribute("data-height")),
    //     h : Number(img.getAttribute("data-width"))
    //   };
    // }
    // else{
    //   base = {
    //     w : Number(img.getAttribute("data-width")),
    //     h : Number(img.getAttribute("data-height"))
    //   };
    // }

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
        width  : w,
        height : h
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
        width  : w,
        height : h
      };
    }
    // 正方形
    else{
      return {
        rate   : img.offsetWidth / base.w,
        top    : 0,
        left   : 0,
        width  : img.offsetWidth,
        height : img.offsetHeight
      };
    }
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
  $$.prototype.viewBG = function(){
    var bg = document.createElement("div");
    bg.className = this.options.dom.base;
    document.body.appendChild(bg);
  };

  // [画像編集] rotateボタンを押した時の処理（左に90度回転）
  $$.prototype.clickRotateButton = function(e){
    var target = e.currentTarget;

    var num = target.parentNode.getAttribute("data-num");
    if(num === null){return;}

    var targetImage = document.querySelector("."+this.options.dom.base+" ul li.pic[data-num='"+num+"'] img."+this.options.dom.img);
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
    this.setTrimRotate_reset(__upperSelector(target , ["."+this.options.dom.li]) , rotateNum);
  };

  //
  $$.prototype.clickDeleteButton = function(e){
    if(!confirm("アップロードリストから写真を破棄しますか？※直接撮影された写真は保存されません。")){return;}

    var target = e.currentTarget;
    var num = target.parentNode.getAttribute("data-num");
    if(num === null){return;}

    var targetListBase = document.querySelector("."+this.options.dom.base+" ul li.pic[data-num='"+num+"']");
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

  $$.prototype.clickTrimButton = function(e){
    var target = e.currentTarget;
    if(!target){return}
    var parent = __upperSelector(target , ["."+this.options.dom.li]);
    if(!parent){return}
    var trim_area = parent.querySelector("."+this.options.dom.trim_area);
    if(!trim_area){return}
    if(trim_area.getAttribute("data-visible") === "1"){
      trim_area.removeAttribute("data-visible");
    }
    else{
      trim_area.setAttribute("data-visible","1");
    }
  };

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
    var img = e.target;

    img.setAttribute("data-width"     , img.naturalWidth);
    img.setAttribute("data-height"    , img.naturalHeight);

    // exif-orientation
    if(typeof window.EXIF !== "undefined"){
      var res = EXIF.getData(img , (function(img,e) {
        var exifData = EXIF.getAllTags(img);
        this.setOrientation(img , exifData);
      }).bind(this , img));
    }
  };

  $$.prototype.setOrientation = function(img , exifData){
    if(!img || !exifData || !exifData.Orientation){return;}
    if(exifData.Orientation != 6 && exifData.Orientation != 8){return}
    var img_area = __upperSelector(img , ["."+this.options.dom.img_area]);
    img_area.setAttribute("data-orientation" , exifData.Orientation);
    var pic = __upperSelector(img_area , ["."+this.options.dom.li]);
    this.setTrimRotate_reset(pic , 0);

  };

  $$.prototype.clickSendButton = function(e){
    var files = this.getForm_typeFile().files;
    var lists = this.getEditImageLists();
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
    fd.append("imageFile"    , this.postFiles_cache[0]);
    fd.append("info[name]"   , this.postFiles_cache[0].name);
    fd.append("info[size]"   , this.postFiles_cache[0].size);
    fd.append("info[type]"   , this.postFiles_cache[0].type);
    fd.append("info[modi]"   , this.postFiles_cache[0].lastModified);
    fd.append("info[date]"   , this.postFiles_cache[0].lastModifiedDate);
    
    var img = viewListElement.querySelector("."+ this.options.dom.img);
    var rotate = (img.getAttribute("data-rotate")) ? img.getAttribute("data-rotate") : "";
    fd.append("info[rotate]" , rotate);
    fd.append("info[width]"  , img.getAttribute("data-width"));
    fd.append("info[height]" , img.getAttribute("data-height"));

    // trim
    var parent = __upperSelector(img , ["."+this.options.dom.li]);
    var trim_area = parent.querySelector("."+this.options.dom.trim_area);
    // var top_left     = parent.querySelector("[data-type='top-left']");
    // var imgSize      = this.getImageSize(img);
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


  // Preview Trim -----
  $$.prototype.trim_pointer_target   = null;
  $$.prototype.trim_pointer_position = null;
  $$.prototype.trim_pointer_cursor   = null;
  $$.prototype.trim_pointer_parent   = null;
  $$.prototype.trim_pointer_imgSize  = null;
  $$.prototype.trim_box = {
    target   : null,
    position : null,
    cursor   : null
  };

  $$.prototype.trim_pointer_down = function(e,pagex,pagey){
    var target = e.target;
    if(!target){return}
    // pointer
    if(target.className === this.options.dom.trim_pointer){
      this.trim_pointer_target   = target;
      this.trim_pointer_position = {x:target.offsetLeft , y:target.offsetTop};
      this.trim_pointer_cursor   = {x:pagex , y:pagey}
      this.trim_pointer_parent   = __upperSelector(target , ["."+this.options.dom.li]);
      var img = this.trim_pointer_parent.querySelector("."+this.options.dom.img);
      this.trim_pointer_imgSize  = this.getImageSize(img);
      target.setAttribute("data-target","1");
    }

    // trim-box
    else if(target.className === this.options.dom.trim_box){
      this.trim_box.target   = target;
      this.trim_box.position = {x:target.offsetLeft , y:target.offsetTop};
      this.trim_box.cursor   = {x:pagex , y:pagey}
    }
    
  };
  $$.prototype.trim_pointer_move = function(e,pagex,pagey){
    e.preventDefault();

    // pointer
    if(this.trim_pointer_target
    && this.trim_pointer_imgSize
    && this.trim_pointer_parent){
      this.set_trim_pointer_target(this.trim_pointer_target , this.trim_pointer_parent , this.trim_pointer_imgSize , pagex , pagey);
    }

    // trim-box
    else if(this.trim_box.target){
      this.set_trim_box_control(pagex , pagey);
    }
  }

  $$.prototype.set_trim_pointer_target = function(target,parent,imgSize,px,py){
    // var borderWidth = 2*2;

    var x = this.trim_pointer_position.x - (this.trim_pointer_cursor.x - px);
    var y = this.trim_pointer_position.y - (this.trim_pointer_cursor.y - py);
    var rotate = parent.querySelector("."+this.options.dom.img).getAttribute("data-rotate");
    // 縦長
    // if(rotate == 90 || rotate == 270){
    var img_area = parent.querySelector("."+this.options.dom.img_area);
    if(this.checkRotate(img_area.getAttribute("data-orientation") , rotate)){
      x = (x < 0) ? 0 : x;
      x = (x > imgSize.height) ? imgSize.height : x;
      y = (y < 0) ? 0 : y;
      y = (y > imgSize.width) ? imgSize.width : y;
    }
    // 横長
    else{
      x = (x < 0) ? 0 : x;
      x = (x > imgSize.width) ? imgSize.width : x;
      y = (y < 0) ? 0 : y;
      y = (y > imgSize.height) ? imgSize.height : y;
    }
    
    
    target.style.setProperty("top"  , y + "px" , "");
    target.style.setProperty("left" , x + "px" , "");

    // interlocking
    var parent = __upperSelector(target , ["."+this.options.dom.li]);
    this.set_trim_popinter_interlocking(target , parent , x , y);
    this.set_trim_popinter_area(parent);
  };

  $$.prototype.set_trim_popinter_interlocking = function(target , parent , x , y){
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

  $$.prototype.set_trim_popinter_area = function(parent){
    var box = parent.querySelector("."+this.options.dom.trim_box);
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

    this.setAttribute_trimSize(parent , {
      left   : left,
      top    : top,
      width  : width,
      height : height
    });
  };

  $$.prototype.setAttribute_trimSize = function(pic , viewSize){
    if(!pic || !viewSize){return;}
    
    var area = pic.querySelector("."+this.options.dom.trim_area);
    if(area.getAttribute("data-visible") !== "1"){return;}

    var box  = pic.querySelector("."+this.options.dom.trim_box);
    var img  = pic.querySelector("."+this.options.dom.img);
    var w = Number(img.getAttribute("data-width"));
    var h = Number(img.getAttribute("data-height"));
    var rate = (w > h) ? area.offsetWidth / w : area.offsetHeight / h;

    img.setAttribute("data-trim-width"  , Math.floor(box.offsetWidth  / rate));
    img.setAttribute("data-trim-height" , Math.floor(box.offsetHeight / rate));

    img.setAttribute("data-trim-x"      , Math.floor(box.offsetLeft   / rate));
    img.setAttribute("data-trim-y"      , Math.floor(box.offsetTop    / rate));

    this.setInfo(pic.getAttribute("data-num") , img);
  };

  // $$.prototype.get_trim_popinter_area = function(pic){
  //   if(!pic){return}
  //   var area = pic.querySelector("."+this.options.dom.trim_area);
  //   var img  = pic.querySelector("."+this.options.dom.img);
  //   var w    = Number(img.getAttribute("data-width"));
  //   var h    = Number(img.getAttribute("data-height"));
  //   var rate = (w > h) ? area.offsetWidth / w : area.offsetHeight / h;

  //   var rotate = img.getAttribute("data-rotate");
  //   rotate = (rotate) ? rotate : 0;

  //   return {
  //     left   : area.offsetLeft   / rate,
  //     top    : area.offsetTop    / rate,
  //     width  : area.offsetWidth  / rate,
  //     height : area.offsetHeight / rate,
  //     rotate : rotate
  //   };
  // }

  // trim処理の終了処理
  $$.prototype.trim_pointer_up = function(e,pagex,pagey){
    // pointer
    if(this.trim_pointer_target
    && this.trim_pointer_imgSize
    && this.trim_pointer_parent){
      this.trim_pointer_target.removeAttribute("data-target");
      this.trim_pointer_target = null;
      this.trim_pointer_position = null;
      this.trim_pointer_cursor = null;
      this.trim_pointer_imgSize  = null;
      this.trim_pointer_parent = null;
    }
    
    // box
    else if(this.trim_box.target
    && this.trim_box.position
    && this.trim_box.cursor){
      this.trim_box = {
        target   : null,
        position : null,
        cursor   : null
      };
    }
  }

  // rotateの際のtrim-pointerの移動処理
  $$.prototype.setTrimRotate_reset = function(parent , afterRotate){
    var img = parent.querySelector("."+this.options.dom.img);
    if(!img){return;}
    var imgSize = this.getImageSize(img);
    if(!imgSize){return}
    // var borderMargin = 2*2;

    // relative
    var trim_relative = parent.querySelector("."+this.options.dom.trim_relative);
    this.setElementStyle_relative(trim_relative , img);


    var top_left     = parent.querySelector("[data-type='top-left']");
    var top_right    = parent.querySelector("[data-type='top-right']");
    var bottom_left  = parent.querySelector("[data-type='bottom-left']");
    var bottom_right = parent.querySelector("[data-type='bottom-right']");

    // 回転値
    var img_area = parent.querySelector("."+this.options.dom.img_area);
    // if(afterRotate == 90 || afterRotate == 270){
    if(this.checkRotate(img_area.getAttribute("data-orientation") , afterRotate)){
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
    
    this.set_trim_popinter_area(parent);
  }

  // orientation + rotate = roll-value
  $$.prototype.checkRotate = function(orientation , rotate){
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


  $$.prototype.setElementStyle_relative = function(trim_relative , img){
    var rotate = img.getAttribute("data-rotate");

    var w = Number(img.getAttribute("data-width"));
    var h = Number(img.getAttribute("data-height"));
    var imgSize = this.getImageSize(img);

    // 回転：横
    // if(rotate == 90 || rotate == 270){
    var img_area = __upperSelector(img , ["."+this.options.dom.img_area]);
    if(this.checkRotate(img_area.getAttribute("data-orientation") , rotate)){
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

  $$.prototype.set_trim_box_control = function(px,py){
    var target = this.trim_box.target;
    if(!target){return}
    var x = this.trim_box.position.x - (this.trim_box.cursor.x - px);
    var y = this.trim_box.position.y - (this.trim_box.cursor.y - py);
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
    bottom_left.style.setProperty("top"  , (y + target.offsetHeight) + "px","");
    bottom_left.style.setProperty("left" , x + "px","");
    bottom_right.style.setProperty("top"  , (y + target.offsetHeight) + "px","");
    bottom_right.style.setProperty("left" , (x + target.offsetWidth) + "px","");
  }

  // 回転の前後で何度回転したかを算出(0->270:-90 , 180->270:)
  $$.prototype.checkRotateDeg = function(beforeRotate , afterRotate){
    var diff = afterRotate - beforeRotate;
    // 左回転
    diff = (diff >  180) ? beforeRotate - afterRotate + 180 : diff;
    // 右回転
    diff = (diff < -180) ? beforeRotate - afterRotate + 180 : diff;
    return diff;
  };

  // モーダル表示infoの書き換え
  $$.prototype.setInfo = function(pid , img){
    if(pid === "undefined" || !img){return;}

    var info = document.querySelector("."+this.options.dom.base+" .pic[data-num='"+pid+"']");
    // var trim_area = info.querySelector("."+this.options.dom.trim_area);
    // if(trim_area.getAttribute("data-visible") !== "1"){return;}

    var w = img.getAttribute("data-width");
    var h = img.getAttribute("data-height");

    var w2 = img.getAttribute("data-trim-width");
    var h2 = img.getAttribute("data-trim-height");

    w = (w2) ? w2 : w;
    h = (h2) ? h2 : h;

    
    if(info){
      var pixel = info.querySelector("."+this.options.dom.info_pixel);
      if(pixel){
        pixel.textContent = "W: "+ Number(w).toLocaleString() + " H: "+ Number(h).toLocaleString();
      }
      var type  = info.querySelector("."+this.options.dom.info_type);
      if(type){
        type.textContent = img.getAttribute("data-type");
      }
      var size  = info.querySelector("."+this.options.dom.info_size);
      if(size){
        var num = img.getAttribute("data-size");
        var val = (num.length <= 6) ? this.convertSize_b2k(num) : this.convertSize_b2m(num);
        size.textContent = val;
      }
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


  
  return $$;

})();
