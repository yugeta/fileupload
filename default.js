;$$fileupload = (function(){

	var __event = function(target, mode, func){
		if (target.addEventListener){target.addEventListener(mode, func, false)}
		else{target.attachEvent('on' + mode, function(){func.call(target , window.event)})}
	};

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

	var __construct = function(){
    switch(document.readyState){
      case "complete"    : new $$;break;
      case "interactive" : __event(window , "DOMContentLoaded" , function(){new $$});break;
      default            : __event(window , "load" , function(){new $$});break;
		}
  };

  // ----------

  var $$ = function(data){

    data.cacheTime = (+new Date());

    // make iframe
		var iframe = this.makeIframe(data);
    this.setIframeInner(iframe , data);

		// upload-button
		this.setButton(iframe , data);

  };

  $$.prototype.makeIframe = function(data){
    var iframe = document.createElement("iframe");
    iframe.src = data.iframe_src;
    iframe.style.setProperty("display","none","");
    __event(iframe , "load" , (function(iframe,data,e){this.setIframeInner(iframe,data)}).bind(this,iframe,data));
    document.body.appendChild(iframe);
    return iframe;
  };

  $$.prototype.setIframeInner = function(iframe , data){
    var form     = document.createElement("form");
		form.name    = "form_" + data.cacheTime;
		form.method  = "POST";
		form.enctype = "multipart/form-data";
    form.action  = data.form_action;
    
    var inp     = document.createElement("input");
		inp.type    = "file";
    inp.name    = data.input_name;
    __event(inp , "change" , (function(iframe,data,e){
      if(typeof data.file_select === "function" && __checkFileAPI()){
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
  
  $$.prototype.setButton = function(iframe , data){
    var btns = document.querySelectorAll(data.btn_selector);
    for(var i=0; i<btns.length; i++){
      __event(btns[i] , "click" , (function(e){this.clickFileButton(e, iframe)}).bind(this , iframe));
    }
  };

  $$.prototype.clickFileButton = function(iframe , e){
    if(!iframe
    || !iframe.contentWindow
    || !iframe.contentWindow.document.body){
      console.log("Error ! (not iframe.)");
      return;
    }

    var typeFile = iframe.contentWindow.document.body.querySelector("form input[type='file']");
    typeFile.click();
  };

  




  // __construct();
  
  return $$;

})();
