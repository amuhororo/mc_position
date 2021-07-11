/* 【メッセージ枠調整プラグイン Ver.3.20】2020/9/3     */
/*  by hororo http://hororo.wp.xdomain.jp/56/      */


//数値のみの時は"px"を追加する。毎度if書くの超めんどい…
$.unit_add = function(val) {
	if (!isNaN(val)) {return val += "px";}
	return val;
};

function mc_position(pm) {
	let that = TYRANO;

	//レイヤー取得
	if(pm.layer === undefined) pm.layer = "message0";
	if(pm.page === undefined) pm.page = "fore";
	let target_layer = that.kag.layer.getLayer(pm.layer,pm.page);
	let layer_outer = target_layer.find(".message_outer");
	let layer_inner = target_layer.find(".message_inner");

	//if(pm.margin)
	//指定が無い時は現在の値を拾う
	if(pm.width === undefined) pm.width = layer_outer.outerWidth();
	if(pm.height === undefined) pm.height = layer_outer.outerHeight();
	if(pm.color === undefined) pm.color = layer_outer.css("background-color");
	if(pm.marginl === undefined) pm.marginl = pm.margin || layer_inner.css("padding-left")   || 10;
	if(pm.margint === undefined) pm.margint = pm.margin || layer_inner.css("padding-top")    || 10;
	if(pm.marginr === undefined) pm.marginr = pm.margin || layer_inner.css("padding-right")  || 10;
	if(pm.marginb === undefined) pm.marginb = pm.margin || layer_inner.css("padding-bottom") || 10;
	if(pm.border_color === undefined) pm.border_color = layer_outer.css("border-color") || "";
	if(pm.border_size === undefined) pm.border_size = layer_outer.css("border-width") || "";
	if(pm.t_marginy === undefined) pm.t_marginy = layer_outer.css("margin-top") || "0";
	if(pm.t_marginx === undefined) pm.t_marginx = layer_outer.css("margin-left") || "0";

	//パラメータ保存処理。疑似要素の値拾うの大変なので、outerのdataに保存
	$.var_save = function(val,name) {
		if(val === undefined) val = layer_outer.attr("data-"+name);
		else layer_outer.attr("data-"+name,val);
		console.log(name,val);
		return val;
	};


	//name追加
	let target_name = target_layer.attr("class").replace("layer", "").replace(pm.layer+"_"+pm.page, "").replace("layer_"+pm.page, "");
	//一回消してから再指定
	if(target_name !="")target_layer.removeClass(target_name);
	$.setName(target_layer, pm.name);


	//ターゲット用
	pm.t_name = $.var_save(pm.t_name,"t_name");
	if(pm.t_name && pm.t_name != "none"){
		pm.t_pos = $.var_save(pm.t_pos,"t_pos");
		pm.bottom = ""; //使わないので無視する
		pm.right = ""; //使わないので無視する

		//widthが単位付きの時はPX値に再計算。
		let width = pm.width;
		if(isNaN(pm.width)){
			if(width.indexOf("em") > -1) width = parseInt(that.kag.config.defaultFontSize)*parseInt(pm.width);
			else if(width.indexOf("%") > -1) width = parseInt($(".tyrano_base").height())*(parseInt(pm.width)/100);
		}

		//ターゲットのサイズ取得
		let t_width = parseInt($("."+pm.t_name).css("width"));
		let t_height = parseInt($("."+pm.t_name).css("height"));
		let t_top = parseInt($("."+pm.t_name).css("top"));
		let t_left = parseInt($("."+pm.t_name).css("left"));

		//位置計算して代入
		if(pm.t_pos == "bottom"){
			pm.top = t_top + t_height;
			if(parseInt(pm.top)+parseInt(pm.height) > parseInt($(".tyrano_base").height())){
				pm.top = parseInt($(".tyrano_base").height())-parseInt(pm.height);
			}
			pm.left = (t_left - ((parseInt(width) - t_width)*0.5));
		}else if(pm.t_pos == "left"){
			pm.top = t_top;
			pm.left = t_left - parseInt(width);
			if(pm.left < 0) pm.left = "0";
		}else if(pm.t_pos == "right"){
			pm.top = t_top;
			pm.left = t_left + t_width;
			if(pm.left + parseInt(pm.width) > parseInt($(".tyrano_base").width())){
				pm.left = parseInt($(".tyrano_base").width()) - parseInt(pm.width);
			}
		}else{
			pm.top = t_top - parseInt(pm.height);
			if(parseInt(pm.top) < 0 ) pm.top = "0";
			pm.left = t_left - ((width - t_width)*0.5);
		}
		//console.log(pm.t_name,t_width,t_height,t_top,t_left,"/",pm.top,pm.left,"/",pm.t_marginy,pm.t_marginx);
	}

	//style設定
	//console.log(pm.top,pm.bottom,pm.left,pm.right,"/",pm.t_marginy,pm.t_marginx);
	let new_style = {};
	if(pm.right){
		new_style["right"] = $.unit_add(pm.right);
		new_style["left"] = "auto";
	}else{
		new_style["right"] = "auto";
		new_style["left"] = $.unit_add(pm.left);
	}
	if(pm.bottom) {
		new_style["bottom"] = $.unit_add(pm.bottom);
		new_style["top"] = "auto";
	}else{
		new_style["bottom"] = "auto";
		new_style["top"] = $.unit_add(pm.top);
	}
	if(pm.width)       new_style["width"] = $.unit_add(pm.width);
	if(pm.height)      new_style["height"] = $.unit_add(pm.height);
	if(pm.color)       new_style["background-color"] = $.convertColor(pm.color);
	if(pm.t_marginy)   new_style["margin-top"] = $.unit_add(pm.t_marginy);
	if(pm.t_marginx)   new_style["margin-left"] = $.unit_add(pm.t_marginx);
	if(pm.radius)      new_style["border-radius"] = $.unit_add(pm.radius);

	// ※ outerにもフォントサイズ指定しないと、em系使いにくいかなー？と
	new_style["font-size"] = $.unit_add(that.kag.config.defaultFontSize)
	new_style["line-height"] = $.unit_add(that.kag.config.defaultFontSize);

	//フレーム画像
	if (pm.frame == "none") {
		layer_outer.css({
			"opacity" : $.convertOpacity(that.kag.config.frameOpacity),
			"background-image" : "",
			"background-color" : $.convertColor(that.kag.config.frameColor)
		})
	}
	else if (pm.frame){
		let storage_url = "";
		if(!pm.bg_size) pm.bg_size = "auto";
		if ($.isHTTP(pm.frame)) {
			storage_url = pm.frame;
		} else {
			storage_url = "./data/image/" + pm.frame ;
		}
		layer_outer.css({
			"background-image" : "url(" + storage_url + ")",
			"background-repeat" : "no-repeat",
			"background-size" : pm.bg_size,
			"opacity" : 1,
			"background-color" : ""
		});
	}

	//透過
	if (pm.opacity) {
		layer_outer.css("opacity", $.convertOpacity(pm.opacity));
	}


	//border
	if(pm.border_color){
		layer_outer.css("border","solid " + $.unit_add(pm.border_size) + $.convertColor(pm.border_color));
	}else{
		layer_outer.css("border","");
	}

	//吹き出し
	pm.balloon = $.var_save(pm.balloon,"balloon");
	if(pm.balloon){
		if(!pm.balloon_size) pm.balloon_size = "15";
		pm.balloon_size = parseInt($.var_save(pm.balloon_size,"balloon_size"))+1;

		let baloon_y;
		if(pm.balloon == "top") baloon_y = "-" + (parseInt(pm.balloon_size)*2) + "px";
		else if(pm.balloon == "bottom") baloon_y = "100%";
		else baloon_y = "50%";

		let baloon_x;
		if(pm.balloon == "left") baloon_x = "-" + (parseInt(pm.balloon_size)*2) + "px";
		else if(pm.balloon == "right") baloon_x = "100%";
		else baloon_x = "50%";

		let border_pos;
		if(pm.balloon == "top") border_pos = "bottom";
		else if(pm.balloon == "bottom") border_pos = "top";
		else if(pm.balloon == "left") border_pos = "right";
		else if(pm.balloon == "right") border_pos = "left";

		let margin_pos;
		if(pm.balloon == "top" || pm.balloon == "bottom") margin_pos = "left";
		else  margin_pos = "top";

		let margin_line;
		if(pm.balloon == "left") margin_line = "margin-left: -" + 3 + "px;";
		else if(pm.balloon == "right") margin_line = "margin-left: 1px;";
		else if(pm.balloon == "top") margin_line = "margin-top: -" + 3 + "px;";
		else margin_line = "margin-top: 1px;";

		//透過した時の隙間埋めで1px詰める
		let margin_1;
		if(pm.balloon == "left") margin_1 = "margin-left: 1px;";
		else if(pm.balloon == "right") margin_1 = "margin-left: -1px;";
		else if(pm.balloon == "top") margin_1 = "margin-top: 1px;";
		else margin_1 = "margin-top: -1px;";

		let baloon_style = "<style>";

		if(pm.border_color){
			let baloon_line;
			if(pm.balloon == "left") baloon_line = "margin-left: -" + ((parseInt(pm.border_size)*2)-1) + "px;";
			else if(pm.balloon == "right") baloon_line = "margin-left: 1px;";
			else if(pm.balloon == "top") baloon_line = "margin-top: -" + ((parseInt(pm.border_size)*2)-1) + "px;";
			else baloon_line = "margin-top: 1px;";

			baloon_style += "."+pm.layer +"_fore .message_outer:before {";
			baloon_style += 'content: "";';
			baloon_style += "position: absolute;";
			baloon_style += "top:" + baloon_y + ";";
			baloon_style += "left:" + baloon_x + ";";
			baloon_style += "margin-" + margin_pos + ": -" +(parseInt(pm.balloon_size)+(parseInt(pm.border_size)-1))+ "px;";
			baloon_style += baloon_line;
			baloon_style += "border: " + (parseInt(pm.balloon_size)+(parseInt(pm.border_size)-1)) + "px solid transparent;";
			baloon_style += "border-" + border_pos + ": " + (parseInt(pm.balloon_size)+(parseInt(pm.border_size)-1)) + "px solid " + $.convertColor(pm.border_color) + ";";
			baloon_style += "}";
		}

		baloon_style += "."+pm.layer +"_fore .message_outer:after {";
		baloon_style += 'content: "";';
		baloon_style += "position: absolute;";
		baloon_style += "top:" + baloon_y + ";";
		baloon_style += "left:" + baloon_x + ";";
		baloon_style += "margin-" + margin_pos + ": -" + parseInt(pm.balloon_size) + "px;";
		baloon_style += margin_1;
		baloon_style += "border:" + pm.balloon_size + "px solid transparent;";
		baloon_style += "border-" +border_pos+ ": " + pm.balloon_size + "px solid " + $.convertColor(pm.color) + ";";
		baloon_style += "}";
		baloon_style += "</style>";

		//空いてるouterにstyleぶっこむと
		layer_outer.html(baloon_style);
	}else{
		layer_outer.html(""); //消すのも簡単
	}

	// ボックスサイズ指定
	new_style["box-sizing"] = "border-box";

	//style設定
	that.kag.setStyles(layer_outer, new_style);
	//innerにも適応する
	that.kag.layer.refMessageLayer(pm.layer);

	//縦書き
	if(pm.vertical){
		if (pm.vertical == "true") {
			that.kag.stat.vertical = "true";
			layer_inner.find("p").addClass("vertical_text");
		} else {
			that.kag.stat.vertical = "false";
			layer_inner.find("p").removeClass("vertical_text");
		}
	}

	//innerのスタイル調整
	let new_style_inner = {};
	if (pm.marginl && pm.marginl != "0") new_style_inner["padding-left"] = $.unit_add(parseInt(pm.marginl));// + "px";
	if (pm.margint && pm.margint != "0") new_style_inner["padding-top"] = $.unit_add(parseInt(pm.margint));// + "px";
	if (pm.marginr && pm.marginr != "0") new_style_inner["padding-right"] = $.unit_add(parseInt(pm.marginr));// + "px";
	if (pm.marginb && pm.marginb != "0") new_style_inner["padding-bottom"] = $.unit_add(parseInt(pm.marginb));// + "px";
	if (pm.t_marginy && pm.t_marginy != "0")new_style_inner["margin-top"] = layer_outer.css("margin-top");
	if (pm.t_marginx && pm.t_marginx != "0")new_style_inner["margin-left"] = layer_outer.css("margin-left");

	// innerの10pxズレを補正
	if(that.kag.tmp.message_frame!==undefined && that.kag.tmp.message_frame.nospace=="true"){
		new_style_inner["top"] = layer_outer.css("top");
		new_style_inner["left"] = layer_outer.css("left");
		new_style_inner["width"] = layer_outer.css("width");
		new_style_inner["height"] = layer_outer.css("height");
	}

	// ボックスサイズ指定
	new_style_inner["box-sizing"] = "border-box";

	that.kag.setStyles(layer_inner, new_style_inner);


	//キャラ名欄をメッセージ枠から相対指定
	if(that.kag.stat.chara_ptext){
		let layer_chara_ptext = target_layer.find("."+that.kag.stat.chara_ptext);
		pm.chara_y = $.var_save(pm.chara_y,"chara_y");
		pm.chara_x = $.var_save(pm.chara_x,"chara_x");
		let chara_ptext_style = {};
		if(pm.chara_y != "") chara_ptext_style["top"] = parseInt(pm.top) + parseInt(pm.chara_y);
		if(pm.chara_x != "") chara_ptext_style["left"] = parseInt(pm.left) + parseInt(pm.chara_x);
		if(pm.t_marginy != "0" && pm.chara_y) chara_ptext_style["margin-top"] = layer_outer.css("margin-top");
		if(pm.t_marginx != "0" && pm.chara_x) chara_ptext_style["margin-left"] = layer_outer.css("margin-left");
		that.kag.setStyles(layer_chara_ptext, chara_ptext_style);
	}

};
