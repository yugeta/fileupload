;$$fileupload = (function(){

  var LIB = function(){};

	LIB.prototype.event = function(target, mode, func){
		if (target.addEventListener){target.addEventListener(mode, func, false)}
		else{target.attachEvent('on' + mode, function(){func.call(target , window.event)})}
	};

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

	LIB.prototype.construct = function(){
    var lib = new LIB();

    switch(document.readyState){
      case "complete"    : new MAIN;break;
      case "interactive" : lib.event(window , "DOMContentLoaded" , function(){new MAIN});break;
      default            : lib.event(window , "load" , function(){new MAIN});break;
		}
  };

  // ----------

  var MAIN = function(data){

    data.cacheTime = (+new Date());

    // make iframe
		var iframe = this.makeIframe(data);
    this.setIframeInner(iframe , data);

		// upload-button
		this.setButton(iframe , data);

  };

  MAIN.prototype.makeIframe = function(data){
    var lib = new LIB();

    var iframe = document.createElement("iframe");
    iframe.src = data.iframe_src;
    iframe.style.setProperty("display","none","");
    lib.event(iframe , "load" , (function(iframe,data,e){this.setIframeInner(iframe,data)}).bind(this,iframe,data));
    document.body.appendChild(iframe);
    return iframe;
  };

  MAIN.prototype.setIframeInner = function(iframe , data){
    var lib = new LIB();

    var form     = document.createElement("form");
		form.name    = "form_" + data.cacheTime;
		form.method  = "POST";
		form.enctype = "multipart/form-data";
    form.action  = data.form_action;
    
    var inp     = document.createElement("input");
		inp.type    = "file";
    inp.name    = data.input_name;
    lib.event(inp , "change" , (function(iframe,data,e){
      if(typeof data.file_select === "function" && lib.checkFileAPI()){
        var input = e.currentTarget;
        data.file_select("filename : "+input.value);
        // console.log(window.File);
        // console.log(window.FileReader);
        // console.log(window.FileList);
        // console.log(window.Blob);
        
      }
      else{
        var form = iframe.contentWindow.document.body.querySelector("form[name='form_"+data.cacheTime+"']");
        form.submit();
      }
    }).bind(this,iframe,data));
    form.appendChild(inp);
    
    for(var i in data.hiddens){
      var inp     = document.createElement("input");
      inp.type    = "hidden";
      inp.name    = i;
      inp.value   = data.hiddens[i];
      form.appendChild(inp);
    }
    iframe.contentWindow.document.body.innerHTML = "";
    iframe.contentWindow.document.body.appendChild(form);
  };
  
  MAIN.prototype.setButton = function(iframe , data){
    var lib = new LIB();

    var btns = document.querySelectorAll(data.btn_selector);
    for(var i=0; i<btns.length; i++){
      lib.event(btns[i] , "click" , (function(e){this.clickFileButton(e, iframe)}).bind(this , iframe));
    }
  };

  MAIN.prototype.clickFileButton = function(iframe , e){
    if(!iframe
    || !iframe.contentWindow
    || !iframe.contentWindow.document.body){
      console.log("Error ! (not iframe.)");
      return;
    }

    var typeFile = iframe.contentWindow.document.body.querySelector("form input[type='file']");
    typeFile.click();
  };

  
  
  return MAIN;

})();
