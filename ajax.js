/**
 * ajax.js
 * Author : Yugeta.Koji (Mynt Inc,.)
 * Date   : 2019.07.20
 * Modify : 2019.08.08 : file last-modified
 * Example : 
 * $$mynt_ajax | $$ajax({
 *   url:"",				// http://example.com/
 *   method:"POST",	// POST or GET
 *   async:true,		// true or false
 *   data:{},				// Object
 *   query:{},			// Object
 *   querys:[]			// Array
 * });
 * [History]
 * 2019.09.15 : noquery-pattern method=get only
 */
;$$ajax = $$mynt_ajax = (function(){

	var $$ = function(options){
    if(!options){return}
		var httpoj = this.createHttpRequest();
		if(!httpoj){return;}
		// open メソッド;
		var option = this.setOption(options);

		// queryデータ
		var data = this.setQuery(option);
		if(!data.length){
			option.method = "get";
		}

		// 実行
		httpoj.open( option.method , option.url , option.async );
		// type
		if(option.type){
			httpoj.setRequestHeader('Content-Type', option.type);
		}
		
		// onload-check
		httpoj.onreadystatechange = function(){
			//readyState値は4で受信完了;
			if (this.readyState==4 && httpoj.status == 200){
				//コールバック
				option.onSuccess(this.responseText);
			}
		};

		// FormData 送信用
		if(typeof option.form === "object" && Object.keys(option.form).length){
			httpoj.send(option.form);
		}
		// query整形後 送信
		else{
			//send メソッド
			if(data.length){
				httpoj.send(data.join("&"));
			}
			else{
				httpoj.send();
			}
		}
		
  };
	$$.prototype.dataOption = {
		url:"",
		query:{},				// same-key Nothing
		querys:[],			// same-key OK
		data:{},				// ETC-data event受渡用
		form:{},
		async:"true",		// [trye:非同期 false:同期]
		method:"POST",	// [POST / GET]
		type:"application/x-www-form-urlencoded", // [text/javascript]...
		// type:"text/plane", // [text/javascript]...
		onSuccess:function(res){},
		onError:function(res){}
	};
	$$.prototype.option = {};
	$$.prototype.createHttpRequest = function(){
		//Win ie用
		if(window.ActiveXObject){
			//MSXML2以降用;
			try{return new ActiveXObject("Msxml2.XMLHTTP")}
			catch(e){
				//旧MSXML用;
				try{return new ActiveXObject("Microsoft.XMLHTTP")}
				catch(e2){return null}
			}
		}
		//Win ie以外のXMLHttpRequestオブジェクト実装ブラウザ用;
		else if(window.XMLHttpRequest){return new XMLHttpRequest()}
		else{return null}
	};
	$$.prototype.setOption = function(options){
		var option = {};
		for(var i in this.dataOption){
			if(typeof options[i] != "undefined"){
				option[i] = options[i];
			}
			else{
				option[i] = this.dataOption[i];
			}
		}
		return option;
	};
	$$.prototype.setQuery = function(option){
		var data = [];
		if(typeof option.datas !== "undefined"){

			// data = option.data;
			for(var key of option.datas.keys()){
				data.push(key + "=" + option.datas.get(key));
			}
		}
		if(typeof option.query !== "undefined"){
			for(var i in option.query){
				data.push(i+"="+encodeURIComponent(option.query[i]));
			}
		}
		if(typeof option.querys !== "undefined"){
			for(var i=0;i<option.querys.length;i++){
				if(typeof option.querys[i] == "Array"){
					data.push(option.querys[i][0]+"="+encodeURIComponent(option.querys[i][1]));
				}
				else{
					var sp = option.querys[i].split("=");
					data.push(sp[0]+"="+encodeURIComponent(sp[1]));
				}
			}
		}

		return data;
	};

	/**
	 * filePath @ 読み込みファイル
	 * selector @ 反映するエレメント
	 * callback @ 読み込み完了後に実行するプログラム
	 */
	$$.prototype.loadHTML = function(filePath , selector , callback){
		var url = (filePath.indexOf("?") === -1) ? filePath+"?"+(+new Date()) : filePath+"&"+(+new Date());
		new $$({
      url:url,
      method:"GET",
      async:true,
      onSuccess:(function(selector,res){

        var target = document.querySelector(selector);
				if(!target){return;}
				// target.innerHTML = "";

				// resをelementに変換
				var div1 = document.createElement("div");
				var div2 = document.createElement("div");
				div1.innerHTML = res;
				// if(body = div1.querySelector("body")){
				// 	div1.innerHTML = body.innerHTML;
				// }

				// script抜き出し
				var scripts = div1.getElementsByTagName("script");
				while(scripts.length){
					div2.appendChild(scripts[0]);
				}

				// script以外
				target.innerHTML = div1.innerHTML;

				// script
				this.orderScripts(div2 , target);

				// callback
				if(callback){
					callback();
				}

      }).bind(this,selector)
    });
	};

	$$.prototype.orderScripts = function(scripts , target){
		if(!scripts.childNodes.length){return;}
		
		var trash = document.createElement("div");
		var newScript = document.createElement("script");
		if(scripts.childNodes[0].innerHTML){newScript.innerHTML = scripts.childNodes[0].innerHTML;}

		// Attributes
		var attrs = scripts.childNodes[0].attributes;
		for(var i=0; i<attrs.length; i++){
			newScript.setAttribute(attrs[i].name , attrs[i].value);
		}

		// script実行（読み込み）
		target.appendChild(newScript);
		trash.appendChild(scripts.childNodes[0]);
		this.orderScripts(scripts , target);

	};

	$$.prototype.addHTML = function(filePath , selector , callback){
		var url = (filePath.indexOf("?") === -1) ? filePath+"?"+(+new Date()) : filePath+"&"+(+new Date());
		new $$({
      url:url,
      method:"GET",
      async:true,
      onSuccess:(function(selector,res){

        var target = document.querySelector(selector);
				if(!target){return;}
				// target.innerHTML = "";

				// resをelementに変換
				var div1 = document.createElement("div");
				var div2 = document.createElement("div");
				div1.innerHTML = res;

				// script抜き出し
				var scripts = div1.getElementsByTagName("script");
				while(scripts.length){
					div2.appendChild(scripts[0]);
				}

				// script以外
				target.innerHTML += div1.innerHTML;

				// script
				this.orderScripts(div2 , target);

				// callback
				if(callback){
					callback();
				}

      }).bind(this,selector)
    });
	};

	$$.prototype.lastModified = function(path , callback){
		if(!path || !callback){return}
		var httpoj = this.createHttpRequest();
		if(!httpoj){return}

		httpoj.open("get" , path);
		httpoj.onreadystatechange = (function(callback){
			if (httpoj.readyState == 4 && httpoj.status == 200) {
				var date = new Date(httpoj.getResponseHeader("last-modified"));
				var res = {
					date : date,
					y : date.getFullYear(),
					m : date.getMonth() + 1,
					d : date.getDate(),
					h : date.getHours(),
					i : date.getMinutes(),
					s : date.getSeconds()
				};
				callback(res);
			}
		}).bind(this,callback);
		httpoj.send(null);
	};

  return $$;
})();
