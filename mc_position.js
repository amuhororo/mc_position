/* 【吹き出しプラグイン Ver.0.02】2021/07/22       */
/*  by hororo http://hororo.wp.xdomain.jp/        */


//数値のみの時は"px"を追加する。毎度if書くの超めんどい…
$.unit_add = function(val) {
	if (!isNaN(val)) {return val += "px";}
	return val;
};

function mc_position(pm) {
	let that = TYRANO;

	//レイヤー取得
	if(pm.layer === undefined) pm.layer = that.kag.stat.current_layer;//"message0";
	if(pm.page === undefined) pm.page = "fore";
	let target_layer = that.kag.layer.getLayer(pm.layer,pm.page);
	let layer_outer = target_layer.find(".message_outer");
	let layer_inner = target_layer.find(".message_inner");

	//パラメータ保存処理。outerのdataに保存してしまおう
	$.var_save = function(val,name) {
		if(val === undefined) val = layer_outer.attr("data-"+name);
		else layer_outer.attr("data-"+name,val);
		return val;
	};

	//name追加
	if(pm.name !== undefined){
		//※大外にしとけば融通が利くかなと
		let target_name = target_layer.attr("class").replace("layer", "").replace(pm.layer+"_"+pm.page, "").replace("layer_"+pm.page, "");
		//nameは一回消してから再指定
		if(pm.name == "" && target_name !="")target_layer.removeClass(target_name);
		$.setName(target_layer, pm.name);
	};

	//ターゲット
	pm.target_name = $.var_save(pm.target_name,"target_name");
	pm.target_y = $.var_save(pm.target_y,"target_y");
	pm.target_x = $.var_save(pm.target_x,"target_x");
	let target_y = pm.target_y;
	let target_x = pm.target_x;

	if(pm.target_name){// && pm.target_name != "none"){
		pm.target_pos = $.var_save(pm.target_pos,"target_pos");
		pm.bottom = ""; //使わないので無視する
		pm.right = "";  //使わないので無視する

		//widthが単位付きの時はPX値に再計算。
		let width;
		if(pm.width === undefined) width = parseInt(layer_outer.outerWidth());
		else if(isNaN(pm.width)){
			if(pm.width.indexOf("em") > -1) width = parseInt(that.kag.config.defaultFontSize)*parseInt(pm.width);
			else if(pm.width.indexOf("%") > -1) width = parseInt($(".tyrano_base").height())*(parseInt(pm.width)/100);
		}else width = pm.width;

		//ターゲット要素のサイズ取得
		let t_width = parseInt($("."+pm.target_name).css("width"));
		let t_height = parseInt($("."+pm.target_name).css("height"));
		let t_top = parseInt($("."+pm.target_name).css("top"));
		let t_left = parseInt($("."+pm.target_name).css("left"));

		//位置計算して代入
		if(pm.target_pos == "bottom"){
			pm.top = t_top + t_height;
			if(parseInt(pm.top)+parseInt(pm.height) > parseInt($(".tyrano_base").height())){
				pm.top = parseInt($(".tyrano_base").height())-parseInt(pm.height);
				if(target_y > 0) target_y = 0;
			}
			pm.left = (t_left - ((parseInt(width) - t_width)*0.5));
		}else if(pm.target_pos == "left"){
			pm.top = t_top;
			pm.left = t_left - parseInt(width);
			if(pm.left < 0){
				pm.left = "0";
				if(target_x < 0) target_x = 0;
			}
		}else if(pm.target_pos == "right"){
			pm.top = t_top;
			pm.left = t_left + t_width;
			if(pm.left + parseInt(pm.width) > parseInt($(".tyrano_base").width())){
				pm.left = parseInt($(".tyrano_base").width()) - parseInt(pm.width);
				if(target_x > 0) target_x = 0;
			}
		}else{
			pm.top = t_top - parseInt(pm.height);
			if(parseInt(pm.top) < 0 ){
				pm.top = "0";
				if(target_y < 0) target_y = 0;
			}
			pm.left = t_left - ((width - t_width)*0.5);
		}
	}else{
		target_y = "auto";
		target_x = "auto";
	};

	//表示位置
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
	new_style["margin-top"] = $.unit_add(target_y);
	new_style["margin-left"] = $.unit_add(target_x);

	//radius
	if(pm.radius == "" || pm.radius == "none" ) pm.radius = "0";
	if(pm.radius) new_style["border-radius"] = $.unit_add(pm.radius);

	//サイズと色
	if(pm.width) new_style["width"] = $.unit_add(pm.width);
	if(pm.height) new_style["height"] = $.unit_add(pm.height);
	if(pm.color) new_style["background-color"] = $.convertColor(pm.color);

	// ※ outerにもフォントサイズ指定しないと、em系使いにくいかなー？と思ったけどそもそもemが使いにくいな
	new_style["font-size"] = $.unit_add(that.kag.config.defaultFontSize)
	new_style["line-height"] = $.unit_add(that.kag.config.defaultFontSize);

	//フレーム画像
	if (pm.frame == "" || pm.frame == "none") {
		layer_outer.css({
			"opacity" : $.convertOpacity(that.kag.config.frameOpacity),
			"background-image" : "",
			"background-color" : $.convertColor(that.kag.config.frameColor)
		})
	}
	else if (pm.frame){
		let storage_url = "";
		if(pm.bg_size == "") pm.bg_size = "auto";
		else if(pm.bg_size === undefined) pm.bg_size = layer_outer.css("background-size");
		else pm.bg_size = pm.bg_size.replace("," , " ");
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
	if(pm.border_color === undefined) pm.border_color = layer_outer.css("border-color");
	if(pm.border_size === undefined) pm.border_size = layer_outer.css("border-width");
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
		//縦位置
		let baloon_y;
		if(pm.balloon == "top") baloon_y = "-" + (parseInt(pm.balloon_size)*2) + "px";
		else if(pm.balloon == "bottom") baloon_y = "100%";
		else baloon_y = "50%";
		//横位置
		let baloon_x;
		if(pm.balloon == "left") baloon_x = "-" + (parseInt(pm.balloon_size)*2) + "px";
		else if(pm.balloon == "right") baloon_x = "100%";
		else baloon_x = "50%";
		//吹き出しの向き
		let border_pos;
		if(pm.balloon == "top") border_pos = "bottom";
		else if(pm.balloon == "bottom") border_pos = "top";
		else if(pm.balloon == "left") border_pos = "right";
		else if(pm.balloon == "right") border_pos = "left";
		//調整方向
		let margin_pos;
		if(pm.balloon == "top" || pm.balloon == "bottom") margin_pos = "left";
		else  margin_pos = "top";
		//透過した時の隙間埋めで1px詰める
		let margin_1;
		if(pm.balloon == "left") margin_1 = "left: 1px;";
		else if(pm.balloon == "right") margin_1 = "left: -1px;";
		else if(pm.balloon == "top") margin_1 = "top: 1px;";
		else margin_1 = "top: -1px;";
		//色
		let color;
		if(pm.color === undefined) color = layer_outer.css("background-color");
		//styleタグ
		let baloon_style = "<style>";
		//枠線
		if(pm.border_color){
			//枠線分表示位置ズラす
			let baloon_line;
			if(pm.balloon == "left") baloon_line = "left: -" + ((parseInt(pm.border_size)*2)-1) + "px;";
			else if(pm.balloon == "right") baloon_line = "left: 1px;";
			else if(pm.balloon == "top") baloon_line = "top: -" + ((parseInt(pm.border_size)*2)-1) + "px;";
			else baloon_line = "top: 1px;";
			//styleタグ
			baloon_style += "."+pm.layer +"_fore .message_outer:before {";
			baloon_style += 'content: "";';
			baloon_style += "position: absolute;";
			baloon_style += "top:" + baloon_y + ";";
			baloon_style += "left:" + baloon_x + ";";
			baloon_style += "margin-" + margin_pos + ": -" +(parseInt(pm.balloon_size)+(parseInt(pm.border_size)-1))+ "px;";
			baloon_style += "margin-" + baloon_line;
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
		baloon_style += "margin-" + margin_1;
		baloon_style += "border:" + pm.balloon_size + "px solid transparent;";
		baloon_style += "border-" +border_pos+ ": " + pm.balloon_size + "px solid " + $.convertColor(color) + ";";
		baloon_style += "}";
		baloon_style += "</style>";

		layer_outer.html(baloon_style);  //空いてるouterにstyleぶっこむと…
	}else{
		layer_outer.html("");            //消すのが簡単だけどもどうなん…
	}

	//ボックスサイズ指定
	new_style["box-sizing"] = "border-box";

	//style設定
	that.kag.setStyles(layer_outer, new_style);
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
	if(pm.margint === undefined) pm.margint = pm.margin || layer_inner.css("padding-top");
	if(pm.marginr === undefined) pm.marginr = pm.margin || layer_inner.css("padding-right");
	if(pm.marginb === undefined) pm.marginb = pm.margin || layer_inner.css("padding-bottom");
	if(pm.marginl === undefined) pm.marginl = pm.margin || layer_inner.css("padding-left");
	//padding
	new_style_inner["padding-top"] = $.unit_add(parseInt(pm.margint));
	new_style_inner["padding-right"] = $.unit_add(parseInt(pm.marginr));
	new_style_inner["padding-bottom"] = $.unit_add(parseInt(pm.marginb));
	new_style_inner["padding-left"] = $.unit_add(parseInt(pm.marginl));
	//margin
	new_style_inner["margin-top"] = layer_outer.css("margin-top");
	new_style_inner["margin-left"] = layer_outer.css("margin-left");
	//10pxズレを補正
	new_style_inner["top"] = layer_outer.css("top");
	new_style_inner["left"] = layer_outer.css("left");
	new_style_inner["width"] = layer_outer.css("width");
	new_style_inner["height"] = layer_outer.css("height");
	//padding使うのでボックスサイズ指定
	new_style_inner["box-sizing"] = "border-box";

	//スタイルを適用
	that.kag.setStyles(layer_inner, new_style_inner);

	//キャラ名欄をメッセージ枠から相対指定
	if(that.kag.stat.chara_ptext){
		let layer_chara_ptext = target_layer.find("."+that.kag.stat.chara_ptext);
		pm.chara_y = $.var_save(pm.chara_y,"chara_y");
		pm.chara_x = $.var_save(pm.chara_x,"chara_x");
		let chara_ptext_style = {};
		if(pm.chara_y != "") chara_ptext_style["top"] = parseInt(pm.top) + parseInt(pm.chara_y);
		if(pm.chara_x != "") chara_ptext_style["left"] = parseInt(pm.left) + parseInt(pm.chara_x);
		if(pm.target_y != "0" && pm.chara_y) chara_ptext_style["margin-top"] = layer_outer.css("margin-top");
		if(pm.target_x != "0" && pm.chara_x) chara_ptext_style["margin-left"] = layer_outer.css("margin-left");
		that.kag.setStyles(layer_chara_ptext, chara_ptext_style);
	}

};
