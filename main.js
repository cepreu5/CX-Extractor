const WLimit=501; // определя дали бутоните да са отгоре
var Encrypted=true; // false uncomment crypto-js above and use the correct TableFiles.txt

var ReplaceF, // Replace Field calculated in getTmpls and used in Extract
	Z100=true, // zoom level
	ww=window.innerWidth,
	CalcFl=false,
	val="", // initial calculator display value
	Total=0, Cnt=0, // log counter and total
	SelectSheet=0, // selected sheet
	LTmpl=8, // elements in template (without optional replace field and selected sheet)
	AllTmplFlag=false, // don't get Auto templates	
	WorkTmpl, // current template in use
	Start=1, // start position to search in AutoT for triger
	Author = "© 2022 CX Extractor",
	BArea, BAreaSave, // table buttons save area
	cfgTheme="1", // initial values
	ZoomL1="100%",
	ZoomL2="160%",
	cfgZoom=ZoomL1,
	OpenFrom = 'res2'; // calculator OpenFrom which field

function processUser() {
	var parameters = location.search.substring(1).split("&");
	var temp = parameters[0].split("=");
	l = unescape(temp[1]);
	return l;
}

RegExp.quote = function(str) {
     return str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
};

function CheckAuto(F) {//alert(AllTmplFlag)
	if (AllTmplFlag) {return true}
	for (let i=0; i<AutoT.length; i++) { 
		if (F == AutoT[i+1]) {return false}
		i=i+1;  
	}
	return true;
}

function NoAuto() { 
	AllTmplFlag=!AllTmplFlag; //!AllTmplFlag; 
	if (AllTmplFlag) { 
		document.getElementById('No').style.display = "inline"; 
		document.getElementById('Yes').style.display = "none"; 
	} 
	else { 
		document.getElementById('Yes').style.display = "inline"; 
		document.getElementById('No').style.display = "none";
		Start=1;
		AutoTmpl(); 
	} 
	//if (AllTmplFlag) document.getElementById("Info").innerHTML="» Редактиране на екстракт"; //<br>
	getTmpls(); 
}

function trueFalse(part, p1, p2, p3, p4, p5, p6) {
	document.getElementById("sep"+part).hidden=p1;
	if (p1) document.getElementById("sep"+part).value="";
	document.getElementById("lab"+part).hidden=p2;
	document.getElementById("lab"+part+"1").hidden=p3;
	document.getElementById("lab"+part+"2").hidden=p4;
	document.getElementById("count"+part).hidden=p5;
	if (p5) document.getElementById("count"+part).value="1";
	document.getElementById("lab"+part+"3").hidden=p6;
	document.getElementById("Exp"+part).hidden=p6;
	if (p6) document.getElementById("Exp"+part).checked=false;
}

function Combo2(part, types, num, septxt) {
	document.getElementById("Types"+part).options[types-1].selected=true;
	document.getElementById("count"+part).value=num;
	switch(types) {
		case "1":
			document.getElementById("Exp"+part).checked=(septxt=="1");
			trueFalse(part, true, true, false, true, false, false); 
			break;
		case "2":	trueFalse(part, true, true, false, true, false, true); break;
		case "3":
			document.getElementById("sep"+part).value=septxt;
			trueFalse(part, false, false, true, false, false, true);
			break;
		case "4":	trueFalse(part, true, true, false, true, false, true); break;
		case "5": 
			trueFalse(part, true, true, true, true, true, true);
		  document.getElementById("res"+part).value="";
		break;
		case "6":	document.getElementById("sep"+part).value=septxt;
			trueFalse(part, false, false, true, false, false, true);
	}
}
	
function createOpt(f, o) {
	var z, t;
	z = document.createElement("option");
	z.setAttribute("value", f);
	t = document.createTextNode(o);
	z.appendChild(t);
	document.getElementById("Files").appendChild(z);
}

function createFiles() {
	var i;
	for (i=1; i<=Files.length; i++) {
		createOpt(Files[i-1], Files[i].substring(0, 18));
		i++;
	}
}

function createFilesDec(passphrase) {

	function decrypt (encryptedMsg, pass) {
			var keySize = 256;
			var iterations = 1000;
			var salt = CryptoJS.enc.Hex.parse(encryptedMsg.substr(0, 32));
			var iv = CryptoJS.enc.Hex.parse(encryptedMsg.substr(32, 32))
			var encrypted = encryptedMsg.substring(64);
			var key = CryptoJS.PBKDF2(pass, salt, {
					keySize: keySize/32,
					iterations: iterations
			});
			var decrypted = CryptoJS.AES.decrypt(encrypted, key, {
					iv: iv,
					padding: CryptoJS.pad.Pkcs7,
					mode: CryptoJS.mode.CBC
			}).toString(CryptoJS.enc.Utf8);
			return decrypted;
	}

	var i,
		encryptedMsg,
		encryptedHMAC,
		encryptedHTML,
		decryptedHMAC;
	for (i=1; i<=Files.length; i++) {
		encryptedMsg = Files[i-1],
		encryptedHMAC = encryptedMsg.substring(0, 64),
		encryptedHTML = encryptedMsg.substring(64),
		decryptedHMAC = CryptoJS.HmacSHA256(encryptedHTML, CryptoJS.SHA256(passphrase).toString()).toString();
		if (decryptedHMAC !== encryptedHMAC) {
				createOpt("", "Грешна парола");
				document.getElementById("MsgText").value="Програмата е напълно функционална, но няма да изпраща данни.";
		} else {
			createOpt(decrypt(encryptedHTML, passphrase), Files[i].substring(0, 18));
			//document.getElementById("MsgText").value="Тук поставете текста, от който искате да вземете данни.";
		}
		i++;
	}
}

function createCats() {

	function createOpt(n) {
		var z, t;
		z = document.createElement("option");
		z.setAttribute("value", n);
		t = document.createTextNode(n);
		z.appendChild(t);
		document.getElementById("Cats").appendChild(z);
	}

	var i;
	for (i=1; i<=Cats.length; i++) {
		createOpt(Cats[i-1]);
	}
}

function createSubCat(SC) {

	function clearOpts() {
		var i;
		var select = document.getElementById("SubCats");
		var length = select.options.length;
		if (length==1) {return}
		for (i = length-1; i>0; i--) {select.options[i] = null}
	}

	function createOpt(n) {
		var z = document.createElement("option");
		z.setAttribute("value", n);
		var t = document.createTextNode(n);
		z.appendChild(t);
		document.getElementById("SubCats").appendChild(z);
	}

	var a, l, i;
	if (SC=="SubCat0") {clearOpts(); document.getElementById("SubCats").size= 1; return;}
	eval ("l="+SC+".length");
	document.getElementById("SubCats").options[0].selected=true;
	clearOpts();
	for (i=1; i<l+1; i++) {
		eval("a="+SC+"[i-1]");
		createOpt(a);
	}
}

function NoCat() {
	document.getElementById("Cats").options[0].selected=true;
	document.getElementById("SubCats").options[0].selected=true;
}

function createSels() { // Extract selection field

	function createOpt(v, n, s) {
		var z, t;
		z = document.createElement("option");
		z.setAttribute("value", v);
		if (v=="5") {z.setAttribute("selected", true);}
		t = document.createTextNode(n);
		z.appendChild(t);
		document.getElementById("Types"+s).appendChild(z);
	}
		
	function createInp(s, i, sz) {
		var x;
		x = document.createElement("span");
		x.setAttribute("id", "TSpan"+s+i);
		x.setAttribute("class", "tooltip");
		document.getElementById("Sels").appendChild(x);
		if (i=="count") {
			var I1='<input type="number" class="inputMessage" ID="'+i+s+
				'" oninput="Extract6();ChangeTip(\'Tip'+s+i+
				'\', '+s+');" value="1" style="width: '+sz+
				'em" hidden></input>';
			var I2='<span class="tooltiptext" onclick="NowHide(this)" id="Tip'+s+i+
			  '">.</span>';  //alert(I1+I2)
			document.getElementById("TSpan"+s+i).innerHTML=I1+I2;
		}
		else {
			var I1='<input ID="'+i+s+
				'" class="inputMessage" oninput="Extract6();ChangeTip(\'Tip'+s+i+'\', '+s+
				');" value="" size="'+sz+'" hidden></input>';
			var I2='<span class="tooltiptext" onclick="NowHide(this)" id="Tip'+s+i+
			  '">.</span>';  //alert(I1+I2)
			document.getElementById("TSpan"+s+i).innerHTML=I1+I2;
		}
		document.getElementById("Sels").appendChild(x);
	}

	function createChk(i) {
		var x, where;
		x = document.createElement("input");
		x.type = "checkbox";
		x.setAttribute("id", "Exp"+i);
		x.setAttribute("style", "vertical-align: sub;");
		x.setAttribute("onchange", "Extract6()");
		x.setAttribute("hidden", true);
		where = document.getElementById('Sels');
		where.appendChild(x);
	}

	function createLbl(s, n, t) {
		var x;
		x = document.createElement("LABEL");
		x.setAttribute("id", "lab"+s+n);
		x.setAttribute("hidden", true);
		x.innerHTML=t;
		document.getElementById("Sels").appendChild(x);
	}

	var x, i;
	for (i=1; i<=6; i++) {
		x = document.createElement("LABEL");
		//x.setAttribute("id", "L"+i);
		x.innerHTML=i+":";
		document.getElementById("Sels").appendChild(x);
		x = document.createElement("SELECT");
		x.setAttribute("id", "Types"+i);
		x.setAttribute("onChange", "Combo("+i+")");
		x.setAttribute("class", "inputMessage");
		x.setAttribute("style", "height: 23px;");
		document.getElementById("Sels").appendChild(x);
			createOpt("1", "Сума", i);
			createOpt("2", "ДатаЧас", i);
			createOpt("3", "Текст", i);
			createOpt("4", "Число", i);
			createOpt("5", "Празно", i);
			createOpt("6", "RegEx", i);
		document.getElementById("Sels").appendChild(x);
		createLbl(i, "1", " Поредност ");
		createLbl(i, "2", " Брой ");
		createInp(i, "count", 3)
		createLbl(i, "", " След ");
		createInp(i, "sep", 10);
		createLbl(i, "3", "&nbsp Разход");
		createChk(i);

		document.getElementById("Sels").appendChild(document.createElement("br"));
	}
	document.getElementById("Sels").appendChild(document.createElement("hr"));
	document.getElementById("TmplFld").hidden=true;
	document.getElementById("NoteFld").hidden=true;
	document.getElementById("CalcSp").hidden=true; //
}

function ShowAnim(BoxEl) {
	document.getElementById(BoxEl).classList.toggle('active');
}

function MakeTmpl() {
	var Tmpl='';
	var i, L, C, S; 
	document.getElementById("res").value="";
	for (i=1; i<=(LTmpl-2); i++) {
		S='';
		Tmpl=Tmpl+i+'-';
		switch (document.getElementById("Types"+i).value) {
			case "1":	L='С'; S="0"
				if (document.getElementById("Exp"+i).checked) S="1";
				break;
			case "2": L='Д'; break;
			case "3": L='Т';
				S=document.getElementById("sep"+i).value;
				break;
			case "4": L='Ч'; break;
			case "5": L='П'; break;
			case "6": L='R';
				S=document.getElementById("sep"+i).value;
				S=S.replace(/\\/gi, "\\\\");
		}
		C='';
		if (document.getElementById("Types"+i).value != 5) {
			C=document.getElementById("count"+i).value;
		}
		Tmpl=Tmpl+L+';'+C;
		if (S != '') {Tmpl=Tmpl+';'+S;}
		Tmpl=Tmpl+'#';
	}
	Tmpl=Tmpl+(LTmpl-1)+"-К;"+document.getElementById("Cats").value+"#"+
		LTmpl+"-О;"+document.getElementById("SubCats").value+"##"
		+document.getElementById("Files").selectedIndex;
	if (Tmpl!=Templates[1]) {
		// Tmpl='"'+Tmpl+'",';
		// document.getElementById("res").value='"'+document.getElementById("TmplName").value+'", '+Tmpl;
		document.getElementById("res").value=Tmpl;
	}
	if (WorkTmpl!="") { 
		let Found=FindInCol(AutoT, document.getElementById("TmplName").value, 1); //show auto
		if (Found>=0) document.getElementById("TmplAuto").value=AutoT[Found-1];
	}
	document.getElementById("blink").hidden=true;
}

function ClearTmplFld() {
	ClearFld('TmplName'); 
	ClearFld('TmplAuto'); 
	ClearFld('Replace'); 
	ClearFld('ReplWith');
	ClearFld('ReplFld');
	ClearTemplate();
}

function GetRepl() {
	spinImage("ReplBtn");
	let CVal=document.getElementById("res"+document.getElementById("ReplFld").value).value;
	document.getElementById("ReplWith").value=CVal; // show replace with
	let Found=FindInCol(Replaces, CVal, 1); // show replace
	if (Found>=0) document.getElementById("Replace").value=Replaces[Found-1];
}

function FillTmplFdl(Tmpl, clear) {
	if (clear) ClearTmplFld();
	//document.getElementById("res").value=Tmpl;
	let CVal = document.getElementById("Templates").selectedIndex; // show templ name
	if (CVal>1) {
		WorkTmpl=document.getElementById("Templates").options[CVal].text;
		document.getElementById("TmplName").value=WorkTmpl;
	}
	let Found=FindInCol(AutoT, document.getElementById("TmplName").value, 1); // show Auto
	if (Found>=0) document.getElementById("TmplAuto").value=AutoT[Found-1];
	Found=Tmpl.match(/#\d#/g); //get replace fld number
	document.getElementById("ReplFld").value="";
	if (Found!=null) document.getElementById("ReplFld").value=Found[0][1];
}

function SelTmpl(Tmpl, clear) {
	if (clear) {
	  document.getElementById("Info").innerHTML="» Редактиране на екстракт";
	  if (document.getElementById("Sels").classList.length>0) ShowAnim("Sels");
	  if (document.getElementById("TmplFld").classList.length>0) ShowAnim('TmplFld');
	}
	//if (Tmpl!=Templates[1]) document.getElementById("res").value=Tmpl;
	var result, fsplit, first, second, sep, I;
	if ((Tmpl.match(/#/g)==null) || (Tmpl.match(/;/g)==null)) {return}
	if (Tmpl[0] == '"') { // delete "s
		result=Tmpl.split('"');
		Tmpl=result[1];
	}	
	result=Tmpl.split("#");
	ReplaceF=result[LTmpl];
	if (typeof ReplaceF === "undefined") ReplaceF=0;
	SelectSheet=result[LTmpl+1];
	if (typeof SelectSheet === "undefined") SelectSheet=0;
	document.getElementById("Files").options.selectedIndex=SelectSheet;
	SelFile();
	for (I=0; I<LTmpl; I++) {
		first=result[I];
			if (first.match(/;/g)==null) {return}
			fsplit=first.split(";");
		if (fsplit.length>2) {sep=fsplit[2]}
			second=fsplit[1];
		if (typeof sep === "undefined") {sep="";}
		switch(first.slice(2,3)) {
			case "С": Combo2(I+1, "1", second, sep); break;
			case "Д": Combo2(I+1, "2", second, sep); break;
			case "Т": Combo2(I+1, "3", second, sep); break;
			case "Ч": Combo2(I+1, "4", second, sep); break;
			case "П": Combo2(I+1, "5", second, sep); break;
			case "R": Combo2(I+1, "6", second, sep); break;
			case "К": document.getElementById("Cats").value=second;	break;
			case "О":
				createSubCat("SubCat"+document.getElementById("Cats").options.selectedIndex);
				document.getElementById("SubCats").value=second;
		}
	}
}

function UseTmpl() {
	var Tmpl=document.getElementById("res").value;
	if (Tmpl=="") {return}
	if (Tmpl[0] == '"') { // delete "s and ,
		result=Tmpl.split('"');
		Tmpl=result[1];
	}	
	SelTmpl(Tmpl, true); //console.log(Tmpl);
	Extract6();
}

function getTmpls() {
	var i;
	var htmlString = '<select id="Templates" style="width: 133px;" class="inputMessage" '+
		'onChange="SelTmpl(' + 
		"document.getElementById('Templates').value" +
		', true); Extract6()"><option value="'+Templates[1]+'">Изберете шаблон</option>';
	//ReplaceF=3;
	for (i=0; i<Templates.length; i++) {
		if (CheckAuto(Templates[i])) { //exclude Auto templates
			htmlString = htmlString + 
				'<option value="'+Templates[i+1]+'">'+Templates[i]+'</option>';
		}	
		i=i+1;  
	}
	htmlString = htmlString + '</select>';
	document.getElementById('Sel').innerHTML = htmlString;
}

function Replace(F) { 
	var i;
	if (F > 0) {
		var FTR=document.getElementById('res'+F).value;
		for (i=0; i<Replaces.length; i++) { 
			if (FTR == Replaces[i]) {document.getElementById('res'+F).value=Replaces[i+1];}
			i=i+1;  
		}
	}	
}

function Extract6() {
	var text=document.getElementById("MsgText").value;
	text=text + ' ';	// to process dd.dd at the end
	var Exp, T, TT, TS, sep, count, Incl, pattern, re, work, WordTmpl, WordTmpF;

	function Process(part, pattern, c) {
		re = new RegExp(pattern,"g");
		work=text.match(re);
		if ((work!=null) && (work[c]!=undefined) && (c<=work.length)) {
			document.getElementById("res"+part).value=work[c];
		}
	}

	for (part=1; part<=6; part++) {
		sep=document.getElementById("sep"+part).value;
		count=document.getElementById("count"+part).value;
		switch (document.getElementById("Types"+part).value) {
			case "1":
				pattern = "(\-|[0-9])+(\\.|\\,)([0-9]{1,2})( |\n|\t)"; 
				re = new RegExp(pattern,"g");
				var Sum=text.match(re);
				if (Sum!=null) {Sum=text.match(re)[count-1]}
				Exp=document.getElementById("Exp"+part).checked; //alert(Exp);
				if (Sum!=undefined) {
					if (Exp) Sum="-"+Sum; // alert(Sum);
					// Sum=Sum.replace(",", ".");
					document.getElementById("res"+part).value=Sum.trim();
				}	
				break;
			case "2":
				pattern = "[0-9]+(\\.|\\-|:|/\)[0-9]+(\\.|\\-|:|/\)[0-9]+";
				Process(part, pattern, count-1);
				break;
			case "3": // text
				if (sep=="") break;
				document.getElementById("res"+part).value="";
				T='', WordTmpl=''; // remove Tmpl chars
				var ii, Yes="^";
				WordTmpF = (sep.substr(-1)==Yes);
				if (WordTmpF) { // remove - ^ chars and store them in WordTmpl
					while (sep.substr(-1)==Yes || sep.substr(-1)=="-") {
						WordTmpl=sep.substr(-1)+WordTmpl;
						sep=sep.substr(0,sep.length-1);
					}
				}
				Incl = (sep.substr(-1)=="+");
				if (sep.substr(-1)==">") {
					pattern = "(?<=([A-z,0-9,А-я,\,\.\:]+\s){0})([A-z,0-9,А-я,\,\.\:]+)";
					Process(part, pattern, count-1);
					break;
				}
				if (Incl) sep=sep.substr(0,sep.length-1); // cut +    alert(sep)
				PutTxt = (sep.substr(-1)=="!");
				if (PutTxt) {document.getElementById("res"+part).value= // cut !
					sep.substr(0,sep.length-1);
				} else {	
					pattern = sep.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + 
							"\\s+(\\S+(?:\\s+\\S+){0," + (count-1) + "})";
					re = new RegExp(pattern,"gi"); //alert(text+sep)
					while (m=re.exec(text)) {T=T+m[1];}
					re = new RegExp(sep,"gi");
					if (Incl && (text.match(re)!==null)) T=sep + " " + T;
					if (T.substr(-1)==".") {T=T.substr(0,T.length-1);}
					TS=T.split(' '), TT=""; // strip extra spaces
					for (ii=0; ii<TS.length; ii++) if (TS[ii]!="") TT=TT+" "+TS[ii];
					TT=TT.trim();
					if (WordTmpF) {
						TS=TT.split(' '), TT=""; // strip extra words
						if (Incl) WordTmpl=Yes+WordTmpl;
						for (ii=0; ii<TS.length; ii++) if (WordTmpl[ii]==Yes) TT=TT+" "+TS[ii];
					}	
					document.getElementById("res"+part).value=TT.trim();//.match(/[\w,\s,\.,\*:]+[^\.]/);
				}
				break;
			case "4":
				pattern = "[0-9]+";
				Process(part, pattern, count-1);
				break;
			case "5":
				document.getElementById("res"+part).value="";
				break;
			case "6":
				if (sep=="") {break}
				pattern = document.getElementById("sep"+part).value;
				var c=document.getElementById("count"+part).value-1;
				Process(part, pattern, c);
		}
	}
	Replace(ReplaceF);
	document.getElementById("Note").value="";
	if (document.getElementById("res1").value == "") InsDate();
}

function Combo(part) {
	switch(document.getElementById("Types"+part).value) {
		case "1": trueFalse(part, true, true, false, true, false, false); break;
		case "2": trueFalse(part, true, true, false, true, false, true); break;
		case "3": trueFalse(part, false, false, true, false, false, true); break;
		case "4": trueFalse(part, true, true, false, true, false, true); break;
		case "5": trueFalse(part, true, true, true, true, true, true); break;
		case "6": trueFalse(part, false, false, true, false, false, true);
		  document.getElementById("res"+part).value="";
	}
	Extract6();
}

function AutoTmpl() {
	document.getElementById("NormBtn").title="Нормализация";
	var i, j, stop=false;
	var text=document.getElementById("MsgText").value;
	if (!AllTmplFlag && (text!="")) {
		for (i=Start; i<AutoT.length; i++) {
			if (i==(AutoT.length-1)) Start=1; // next search from begining again
			var re = new RegExp(AutoT[i-1].replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'),"gi");
			if (text.match(re)) { // намерен е тригера в текста
				for (j=0; j<Templates.length; j++) { // търсим шаблон със съответното име и го прилагаме
					if (AutoT[i].toUpperCase() == Templates[j].toUpperCase()) {
						WorkTmpl=Templates[j];
						document.getElementById("TmplName").value=Templates[j];
						document.getElementById("Info").innerHTML="» Редактиране на шаблон: "+WorkTmpl;
						ClearDef();
						SelTmpl(Templates[j+1], false);
						Extract6();
						FillTmplFdl(Templates[j+1], false);
						stop=true;
						Start=i+2; // ready for next search
						break;
					}
					j++;
				}
			}
			if (stop) break;
			i++;
		}
	}
}

function spinImage(ImgID) {
	let imageToSpin = document.getElementById(ImgID);
	setTimeout(function() {
		imageToSpin.classList.toggle('rotated');
	},1500);				
	imageToSpin.classList.toggle('rotated');
}

function Config() {
	ShowAnim("ConfigFld");
	if (cfgTheme=="2") document.getElementById("Theme2").checked = true;
	else document.getElementById("Theme1").checked = true;
	if (cfgZoom==ZoomL2) document.getElementById("Zoom2").checked = true;
	else document.getElementById("Zoom1").checked = true;
	document.getElementById("NormZoom").value=ZoomL1;
	document.getElementById("MaxZoom").value=ZoomL2;
}

function SaveConfig() {
	ShowAnim("ConfigFld");
	if (document.getElementById("Theme1").checked) {
		cfgTheme="1";
		document.getElementById("theme").href = "First.css";
	}
	else {
		cfgTheme="2";
		document.getElementById("theme").href = "Second.css";
	}
	localStorage.setItem("cfgTheme", cfgTheme);
	let theme = document.getElementById("theme");
	if (theme.getAttribute("href") == "Second.css") {
		document.getElementById("Cell1").innerHTML=
			'<input type="submit" class="abutton" title="Изпрати" onclick="showDiv()" value="" style="background-image: url(\'Skin/SendFace.png\');">&nbsp';
		document.getElementById("Cell2").innerHTML=
			'<input type="button" class="abutton" title="Екстракт" style="background-image: url(\'Skin/ExtractFace.png\');" ID="ExtBtn" onclick="ExtClick()">&nbsp';
		document.getElementById("Cell3").innerHTML=
			'<input type="button" class="abutton" title="Бележка" ID="NoteBtn" style="background-image: url(\'Skin/NoteFace.png\');" onclick="ShowAnim(\'NoteFld\')">&nbsp';
		//document.getElementById("Cell4").innerHTML=
		//	'<input type="button" class="abutton" title="Шаблон" style="background-image: url(\'Skin/TemplateFace.png\');" onclick="MakeTmpl()">&nbsp&nbsp';
	} else {
		document.getElementById("Top").innerHTML=BArea;
	}

	if (document.getElementById("Zoom1").checked) cfgZoom=ZoomL1;
	else cfgZoom=ZoomL2;
	//localStorage.setItem("cfgZoom", cfgZoom);
	if (cfgZoom==ZoomL2) {document.body.style.zoom=ZoomL2;
		document.getElementById("ZoomBtn").src="Zoom2.png";
		document.getElementById("ZoomBtn").title="Намали";
		document.getElementById('ZoomBtn2').style.display = "block";
	}	else {document.body.style.zoom=ZoomL1;
		document.getElementById("ZoomBtn").src="Zoom.png";
		document.getElementById("ZoomBtn").title="Увеличи";
		document.getElementById('ZoomBtn2').style.display = "none";
	}

	localStorage.setItem("ZoomL1", document.getElementById("NormZoom").value);
	localStorage.setItem("ZoomL2", document.getElementById("MaxZoom").value);

	location.reload();
}

function Normal() {
	spinImage("NormBtn");
	var text=document.getElementById("MsgText").value;
	if (text === "") {Config();}
	else {
		text=text.replace(/([^\d])\.([^\d\s])/g,'$1. $2');		// aaa.aaa aaa. aaa
		text=text.replace(/([\d]+)\.(\d\d)(0)/g,'$1.$2');				// dd.dd0 dd.dd
		text=text.replace(/([\d])\,([\d\s])/g,'$1.$2');			// dd,dd dd.dd
		text=text.replace(/ ([\d]+) ([\d])/g,' $1$2');			// d ddd dddd
		text=text.replace(/ (\d\d)\:(\d\d) /g,' $1:$2:00 ');			// dd:dd dd:dd:00
		text=text.replace(/ ([\d]) ([\d\s])/g,'$1$2');		// € 5 672.65 € 5672.65
		text=text.replace(/(\d\d\d\d)\-(\d\d)\-(\d\d)/g,'$3.$2.$1'); // 2019-07-19 19.07.2019
		text=text.replace(/(\d\d\d\d)\.(\d\d)\.(\d\d)/g,'$3.$2.$1'); // 2019.07.19 19.07.2019
		text=text.replace(/(\d\d)\-(\d\d)\-(\d\d\d\d)/g,'$1.$2.$3'); // 07-09-2019 07.09.2019
		text=text.replace(/(\d\d)\/(\d\d)\/(\d\d\d\d)/g,'$1.$2.$3'); // 07/09/2019 07.09.2019
		text=text.replace(/(\d\d)\/(\d\d)\/(\d\d)/g,'$1.$2.$3');// 07/09/19 07.09.19
		text=text.replace(/([^\d]),([^\d\s])/g,'$1, $2');		// aaa,aaa aaa, aaa
		text=text.replace(/([\d])\.([^\d\s])/g,'$1. $2');		// 111.aaa 111. aaa
		text=text.replace(/([\d])\,([^\d\s])/g,'$1, $2');		// 111,aaa 111, aaa
		text=text.replace(/\)([^\d\s])/g,') $1');				// )aaa ) aaa
		document.getElementById("MsgText").value=text;
		Extract6();
	}
}

function dataListOpt(Field, List) {
	var i, z, t;
	for (i=0; i<Field.length; i++) {
		z = document.createElement("option");
		t = document.createTextNode(Field[i]);
		z.appendChild(t);
		document.getElementById(List).appendChild(z);
	}
}

function showDiv() {
	var x = (Files.length/2) - 1; // remove ShowSaldo option at first use
	document.getElementById("Files").remove(x);
	CalcFl=true;
	document.getElementById("CalcSp").hidden=true;
	document.getElementById('ZoomBtn2').style.display = "none";
	if (document.getElementById('Suc').style.display == "block") {
		document.getElementById('Suc').style.display = "none";
	}
	document.getElementById("TmplFld").hidden = true;
	document.getElementById('loadingGif').style.display = "block";
}

function showSuc() {
	document.getElementById('loadingGif').style.display = "none";
	document.getElementById('ZoomBtn2').style.display = "none";
	document.getElementById('Suc').style.display = "block";
}

function SelFile() {
	// alert(Files.length/2);
	var x = document.getElementById("Files");
	scriptURL=x.value;  // URL of selected file (table)
	if (x.selectedIndex == ((Files.length/2) - 1)) { // if it is last option
		window.open(scriptURL);
		x.remove(x.selectedIndex); // remove last option
		x.selectedIndex = 0; scriptURL=x.value; // set to first option
	};
	if (x.selectedIndex == ((Files.length/2) - 2)) { // if it is the option before the last one
		window.open(scriptURL);
	}
}

function ShowSplit() {
	document.getElementById("res3").value = ""; // сплит сумите да не се отразяват в сметката
	let S = document.getElementById('res2').value;
	if (S.substr(0,1)=="-") {S=S.substr(1,S.length-1)}
	document.getElementById('res2Split').value = S;
	document.getElementById('res2').value = "";
	ShowAnim("SplitArea");
}

function ShowLog() {
	if (document.getElementById("Log").hidden) {
		document.getElementById("Log").hidden = false;
		document.getElementById("MsgText").hidden = true;
	}
	else { 
		document.getElementById("Log").hidden = true;
		document.getElementById("MsgText").hidden = false;
	}
}

function ExtClick() {
	spinImage('ExtBtn');
	if (document.getElementById("TmplFld").classList.length=0) Extract6()
	else UseTmpl();
}

function SelectAndCopy(What) {
	document.getElementById(What).select();
	Clp = document.getElementById(What).value;
	document.execCommand('copy');
}

function ClearTemplate() {
	document.getElementById("Templates").options[0].selected=true;
	SelTmpl(document.getElementById('Templates').value, true);
	WorkTmpl="";
	Extract6();
}

function ClearTextArea() {
	if (document.getElementById("Log").hidden) {
		document.getElementById("MsgText").value="";
		ClearTemplate();
		document.getElementById("MsgText").focus();
	}
	else {
		document.getElementById("Log").value="";
		Total=0; Cnt=0; // log counter and total
	}
	document.getElementById("NormBtn").title="Параметри";
}

function ClearFld(FldID) {
	document.getElementById(FldID).value="";
}

function ClearDef() {
	if (!(document.getElementById("Templates").options[0]==undefined)) {
		document.getElementById("Templates").options[0].selected=true;
		SelTmpl(document.getElementById("Templates").options[0].value, false);
		Extract6();
	}
}

function ChangeTip(s, i) {//alert(s)
	var T=document.getElementById("res"+i).value;
	if (T=="") {document.getElementById(s).innerHTML="&nbsp";}
	else	{document.getElementById(s).innerHTML=T;}
	document.getElementById(s).style="visibility: visible";
}

function NowHide(obj) {
	obj.style="visibility: hidden";
}

var dt;
function InsDate() {
	
	function FormDate(d) {
	var dd = d.getDate();
		if (dd < 10) dd = '0' + dd;
		var m = d.getMonth() + 1;
		if (m < 10) m = '0' + m;
		document.getElementById("res1").value = dd + "." + m + "." + d.getFullYear();
	}

	if (document.getElementById("res1").value == "") {
		var d = new Date();
		dt = d;
		FormDate(d);
		//alert("1")
		//dt.setDate(dt.getDate() - 1);
		//FormDate(dt);
	} else if (document.getElementById("res3").value == "Планирани") {
		var dsplit=document.getElementById("res1").value.split(".");
		if (dsplit[0].length<2) dsplit[0]='0' + dsplit[0];
		if (dsplit[1].length<2) dsplit[1]='0' + dsplit[1];
		if (dsplit[2].length==2) dsplit[2]='20' + dsplit[2];
		var devent=dsplit[2]+dsplit[1]+dsplit[0];
		devent=devent+"/"+(+devent+1); // next date - new Date(86400000 + +new Date())
		window.open("https://www.google.com/calendar/render?action=TEMPLATE&text="+
		encodeURI(document.getElementById("res4").value)+" "+document.getElementById("res2").value+
		" ("+document.getElementById("res5").value+")"+
		"&dates="+devent+"&details="
		);
	}
	else {
		dt.setDate(dt.getDate() - 1);
		FormDate(dt);
	}
}

function CZoom () {
	Z100=!Z100;
	if (Z100) {document.body.style.zoom=ZoomL2;
		cfgZoom=ZoomL2;
		document.getElementById("Zoom2").checked = true;
		document.getElementById("ZoomBtn").src="Zoom2.png";
		document.getElementById("ZoomBtn").title="Намали";
		document.getElementById('ZoomBtn2').style.display = "block";
	}
	else {document.body.style.zoom=ZoomL1;
		cfgZoom=ZoomL1;
		document.getElementById("Zoom1").checked = true;
		document.getElementById("ZoomBtn").src="Zoom.png";
		document.getElementById("ZoomBtn").title="Увеличи";
		document.getElementById('ZoomBtn2').style.display = "none";
	}
}

function AddCfg() {
	document.getElementById('Author').innerHTML=
		document.getElementById('Author').innerHTML+CfgDate;
}

function switchSheet() {
	let theme = document.getElementById("theme");
	if (theme.getAttribute("href") == "First.css") {
		BAreaSave=BArea;
		theme.href = "Second.css";
		document.getElementById("Cell1").innerHTML=
			'<input type="submit" class="abutton" title="Изпрати" onclick="showDiv()" value="" style="background-image: url(\'Skin/SendFace.png\');">&nbsp';
		document.getElementById("Cell2").innerHTML=
			'<input type="button" class="abutton" title="Екстракт" style="background-image: url(\'Skin/ExtractFace.png\');" ID="ExtBtn" onclick="ExtClick()">&nbsp';
		document.getElementById("Cell3").innerHTML=
			'<input type="button" class="abutton" title="Бележка" ID="NoteBtn" style="background-image: url(\'Skin/NoteFace.png\');" onclick="ShowAnim(\'NoteFld\')">&nbsp';
		if (document.getElementById("Top").innerHTML=="") {BArea=document.getElementById("Bottom").innerHTML;}
		else {BArea=document.getElementById("Top").innerHTML;}
	} else {
		BArea=BAreaSave;
		theme.href = "First.css";
		if (document.getElementById("Top").innerHTML=="") document.getElementById("Bottom").innerHTML=BArea;
		else document.getElementById("Top").innerHTML=BArea;
	}
	if (TextBtns) document.getElementById("TextRow").hidden=false;
}

  function setColor() {
	var SC=document.getElementById("colorPicker").value;
	var root = document.documentElement;
  root.style.setProperty(document.getElementById("Colors").value, SC);
  document.getElementById("Log").value+=
    document.getElementById("Colors").value+": "+SC+";\n";
  document.getElementById("Colors").selectedIndex=0;
}

function LetToDig() {
    var Converted = false;
    var toConv=document.getElementById("res2").value;
    var res = '';
    for (var i=0; i<toConv.length; i++) {
        if (Lets.indexOf(toConv[i].toUpperCase())>=0) {
            res = res + digi[Lets.indexOf(toConv[i].toUpperCase())];
            Converted = true;
        }	
        else res = res + toConv[i];
    }	
    document.getElementById("res2").value = res;
    return Converted;
}

function Calc (SF) {
	if (LetToDig()) return;
	ShowAnim("CalcSp");
	document.getElementById("CalcSp").scrollIntoView();
	CalcFl=!CalcFl;
	if (CalcFl)	{
		// alert(obj.value);
		if (document.getElementById("result").value != "") dis (';');
		dis (document.getElementById('res2').value); // SF
	}
	//else {document.getElementById("Main").scrollIntoView(); } //solve()
}

function ShowColors() {
	if (document.getElementById("colorPicker").hidden) {
		document.getElementById("colorPicker").hidden = false;
		document.getElementById("Colors").hidden = false;
	} else {
		document.getElementById("colorPicker").hidden = true;
		document.getElementById("Colors").hidden = true;
	}
}

function detectSwipe(id, func) {
	const swipe_det = {sX: 0, sY: 0, eX: 0, eY: 0}
	const directions = Object.freeze({
		UP: 'd',
		DOWN: 'u',
		RIGHT: 'r',
		LEFT: 'l'
	})
	// Tune deltaMin according to your needs. Near 0 it will almost always trigger, 
	// with a big value it can never trigger
	const deltaMin = 90
	let direction = null
	const el = document.getElementById(id)
	el.addEventListener('touchstart', function(e) {
		const t = e.touches[0]
		swipe_det.sX = swipe_det.eX = t.screenX
		swipe_det.sY = swipe_det.eY = t.screenY
	}, false)
	el.addEventListener('touchmove', function(e) {
		// Prevent default will stop user from scrolling, use with care
		// e.preventDefault();
		const t = e.touches[0]
		swipe_det.eX = t.screenX
		swipe_det.eY = t.screenY
	}, false)
	el.addEventListener('touchend', function(e) {
		const deltaX = swipe_det.eX - swipe_det.sX
		const deltaY = swipe_det.eY - swipe_det.sY
		//alert("Start: "+swipe_det.sX+", "+swipe_det.sY)
		//alert("End: "+swipe_det.eX+", "+swipe_det.eY)
		//alert("Delta: "+deltaX+", "+deltaY)
		if (deltaX ** 2 + deltaY ** 2 < deltaMin ** 2) return // Min swipe distance
		if (deltaY === 0 || Math.abs(deltaX / deltaY) > 1) // horizontal
			direction = deltaX > 0 ? directions.RIGHT : directions.LEFT
		else // vertical
			direction = deltaY > 0 ? directions.UP : directions.DOWN
		if (direction && typeof func === 'function') func(id, direction)
		direction = null
	}, false)
}

function Gestures(el, d) {
	if (d=="r") CZoom();
	if (d=="l") switchSheet();
	if (d=="u") ClearTextArea();
}

function init() {
	var MsgData;
	createSels();
	dataListOpt(Notes, "combo-options");
	dataListOpt(Accs, "acc-options");
	// document.getElementById("MsgText").value="Тук поставете текста, от който искате да вземете данни.";
	// document.getElementById("MsgText").select()
	AddCfg();
	document.getElementById('Yes').style.display = "inline";
	//document.getElementById("Info").innerHTML="» SW: "+ww+",      "+((100*ww/330)-6).toFixed(0)+"%";
	createCats();
	document.getElementById("Log").value="";
	document.getElementById("PwdFld").hidden = true;
	if (localStorage.getItem("ZoomL1")!=null) ZoomL1=localStorage.getItem("ZoomL1");
	if (localStorage.getItem("ZoomL2")!=null) ZoomL2=localStorage.getItem("ZoomL2");
	CZoom ();
	detectSwipe('MsgText', Gestures);
	if (Encrypted) {
		document.getElementById("PwdFld").hidden = false;
		var pwd = localStorage.getItem("CXpass");
  		if (pwd != null) {
			// Decrypt
			var bytes = CryptoJS.AES.decrypt(pwd, Author); 
			pwd = bytes.toString(CryptoJS.enc.Utf8);
			document.getElementById("Password").value = pwd;
		}
		document.getElementById("Password").focus();
	} else {
		createFiles();
		SelFile();
		document.getElementById("Main").style = "display: inline;";
	}
	MsgData = processUser();
  	if (MsgData != "undefined") document.getElementById("MsgText").value = MsgData;
	BArea = document.getElementById("Top").innerHTML;
	if (ww<WLimit) {
		document.getElementById("Top").hidden = false;
		//document.getElementById("Bottom").parentNode.removeChild(document.getElementById("Bottom"));
	}
	else {
		//document.getElementById("Top").parentNode.removeChild(document.getElementById("Top"));
		document.getElementById("Top").innerHTML="";
		document.getElementById("Bottom").innerHTML=BArea;
		document.getElementById("Bottom").hidden = false;
	}
	if (localStorage.getItem("cfgTheme")!=null) cfgTheme=localStorage.getItem("cfgTheme");
	if (cfgTheme=="2") {
		switchSheet();
		document.getElementById("Theme2").checked = true;
	}	
	if (localStorage.getItem("cfgZoom")!=null) cfgZoom=localStorage.getItem("cfgZoom");
	if (cfgZoom==ZoomL2) {
		CZoom();
		document.getElementById("Zoom2").checked = true;
	}
	//GetMemTemplates();
	getTmpls();
	ClearTextArea();
	if (TextBtns) document.getElementById("TextRow").hidden=false;
}	

function init2() {
	if (document.getElementById("RCookie").checked) {
		// Encrypt
		var ciphertext = CryptoJS.AES.encrypt(document.getElementById("Password").value, Author).toString();
		localStorage.setItem("CXpass", ciphertext);
	}  
	if (document.getElementById("RFgtCookie").checked) {
		localStorage.removeItem("CXpass");
		localStorage.removeItem("ZoomL1");
		localStorage.removeItem("ZoomL2");
		localStorage.removeItem("cfgTheme");
		localStorage.removeItem("cfgZoom");
	}  
	createFilesDec(document.getElementById("Password").value);
	SelFile();
	document.getElementById("PwdFld").hidden = true;
	document.getElementById("Main").style = "display: inline;";
	paste();
}

function paste() {
	Start=1;
	navigator.clipboard.readText().then(clipText => document.getElementById("MsgText").value = clipText);
	setTimeout(function() {
		if (document.getElementById("MsgText").value!="") AutoTmpl();	
	},2500);
	//document.getElementById("Cats").focus();
}

// Calc
//function that display value 
function dis(val) {
	document.getElementById("result").value+=val
} 
	
//function that evaluates the digit and return result 
function solve() {
	let x = document.getElementById("result").value;
	let y = eval(x).toFixed(2);
	if (y!=undefined && y!=Infinity) {
		document.getElementById("result").value = y;
		document.getElementById(OpenFrom).value = y;
	}
	if (x == "") document.getElementById(OpenFrom).value = "";
} 
	
//function that clear the display 
function clr() {
	document.getElementById("result").value = "";
}

function FindInCol(Array, ToFind, Col) {
	let Found=-1;
	for (let i=+Col; i<Array.length; i++) {
		if (Array[i]==ToFind) {Found=i; break}
		i++;
	}
	return Found;
}

function MemAuto() {
	let V=document.getElementById("TmplAuto").value;
	let T=document.getElementById("TmplName").value;
	if (V=="") return;
	let Found=FindInCol(AutoT, V, 0);
	if (Found>=0) {
		AutoT[Found+1]=T; // edit existing
	} else {
		AutoT.push(V);
		AutoT.push(T);
	}
}

function MemReplace() {
	let V=document.getElementById("Replace").value;
	let T=document.getElementById("ReplWith").value;
	if (V=="") return;
	let Found=FindInCol(Replaces, V, 0);
	if (Found>=0) {
		Replaces[Found+1]=T; // edit existing
	} else {
		Replaces.push(V);
		Replaces.push(T);
	}
	T=document.getElementById("res").value;
	V=document.getElementById("ReplFld").value;
	if (+V>6 || +V<1) return;
	T=T.replace("##", "#"+V+"#");
	document.getElementById("res").value=T; //console.log(T);
}

function MemTemplate() {
	let T=document.getElementById("TmplName").value;
	if (T=="") return;
	MemReplace();
	let R=document.getElementById("res").value;
	spinImage("Floppy");
	let Found=FindInCol(Templates, T, 0);
	if ((WorkTmpl=="") && (Found>=0)) {document.getElementById("TmplName").value="Дублирано име!"; return}
	if (Found>=0) {
		Templates[Found+1]=R; // edit existing
	} else {
		Templates.push(T);
		Templates.push(R);
	}
	MemAuto();
	getTmpls(); //recreate template Selection
	document.getElementById("blink").hidden=false;
}

var myBlob, url, anchor;
function FileTemplates(mode) {
	if (mode=="get") {
		ShowLog();
		// (A) CREATE BLOB OBJECT
		document.getElementById("Log").value = "var Templates = [\n";
		for (let i=0; i<Templates.length; i++) {
			document.getElementById("Log").value+='"'+Templates[i]+'", "'+Templates[i+1].replace(/\\/gi, "\\\\")+'",\n';
			i=i+1;  
		}
		document.getElementById("Log").value+='],'
		document.getElementById("Log").value += "\n\nAutoT = [\n";
		for (let i=0; i<AutoT.length; i++) {
			document.getElementById("Log").value+='"'+AutoT[i]+'", "'+AutoT[i+1]+'",\n';
			i=i+1;  
		}
		document.getElementById("Log").value+='],'
		document.getElementById("Log").value += "\n\nReplaces = [\n";
		for (let i=0; i<Replaces.length; i++) {
			document.getElementById("Log").value+='"'+Replaces[i]+'", "'+Replaces[i+1]+'",\n';
			i=i+1;  
		}
		document.getElementById("Log").value+=']\n'
		// (B) CREATE DOWNLOAD LINK
		myBlob = new Blob([document.getElementById("Log").value], {type: "text/plain"});
		url = window.URL.createObjectURL(myBlob);
		anchor = document.createElement("a");
		anchor.href = url;
		anchor.download = "Templates.txt";
	}
	if (mode=="save") {
		anchor.click();
		window.URL.revokeObjectURL(url);
		//document.removeChild(anchor);
		ShowLog();
		document.getElementById("Log").value = "";
	}
}

function EditExtr() {
	//if ((document.getElementById("Sels").classList.length>0) && 
	//	(document.getElementById("TmplFld").classList.length>0)) ShowAnim('TmplFld');
	ShowAnim('Sels');
	if (ww<WLimit) {
	if (document.getElementById("Sels").classList.length>0) {
		document.getElementById("Top").hidden = true;
		document.getElementById("Top").innerHTML="";
		document.getElementById("Bottom").hidden = false;
		document.getElementById("Bottom").innerHTML=BArea;
	}
	else {
		document.getElementById("Top").hidden = false;
		document.getElementById("Top").innerHTML=BArea;
		document.getElementById("Bottom").hidden = true;
		document.getElementById("Bottom").innerHTML="";
	}}
	if (TextBtns) document.getElementById("TextRow").hidden=false;
	let T=document.getElementById("Info").innerHTML;
	let CVal = document.getElementById("Templates").selectedIndex; // show templ name
	if ((CVal>1) && !(T.includes(":"))) {
		document.getElementById("Info").innerHTML+=": "+document.getElementById("Templates").options[CVal].text;
		FillTmplFdl (document.getElementById("Templates").value, false);
	}
	ShowAnim("TmplFld");
	MakeTmpl();
}
