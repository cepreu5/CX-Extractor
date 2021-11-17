function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  var expires = "expires=" + d.toGMTString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function init() {
	getTempls();
	createSels();
	//createCats();
	dataListOpt(Notes, "combo-options");
	dataListOpt(Accs, "acc-options");
	ClearTextArea();
	// document.getElementById("MsgText").value="Тук поставете текста, от който искате да вземете данни.";
	// document.getElementById("MsgText").select()
	AddCfg();
	document.getElementById('Yes').style.display = "inline";
	var ww=window.innerWidth;
	document.getElementById("Info").innerHTML="SW: "+ww;
	if (ww<501) {
		document.getElementById("Top").hidden = false;
		document.getElementById("Bottom").parentNode.removeChild(document.getElementById("Bottom"));
		//document.getElementById("Bottom").hidden = true;
		document.getElementById("CatsTop").hidden = false;
		//document.getElementById("CatsBottom").hidden = true;
		document.getElementById("CatsBottom").parentNode.removeChild(document.getElementById("CatsBottom"));
	}
	else {
		//document.getElementById("Top").hidden = true;
		document.getElementById("Top").parentNode.removeChild(document.getElementById("Top"));
		document.getElementById("Bottom").hidden = false;
		//document.getElementById("CatsTop").hidden = false;
		document.getElementById("CatsTop").parentNode.removeChild(document.getElementById("CatsTop"));
		//document.getElementById("CatsTop").removeChild(document.getElementById("Cats"));
		//document.getElementById("CatsTop").removeChild(document.getElementById("SubCats"));
		document.getElementById("CatsBottom").hidden = false;
	}
	createCats();
	document.getElementById("Log").value="";
	document.getElementById("PwdFld").hidden = true;
	CZoom ();
	detectSwipe('MsgText', zoomfunction);
	if (Encrypted) {
		document.getElementById("PwdFld").hidden = false;
		//var pwd = getCookie("CXpass");
		var pwd = localStorage.getItem("CXpass"); //alert(pwd2);
  		if (pwd != "") {
			// Decrypt
			var bytes  = CryptoJS.AES.decrypt(pwd, Author); pwd = bytes.toString(CryptoJS.enc.Utf8);
			document.getElementById("Password").value = pwd;
		}
		document.getElementById("Password").focus();
	} else {
		createFiles();
		SelFile();
	}
	//myPaste();
}	

function init2() {
	if (document.getElementById("Cookie").checked) {
		// Encrypt
		var ciphertext = CryptoJS.AES.encrypt(document.getElementById("Password").value, Author).toString();
		document.cookie = setCookie("CXpass", ciphertext, 90);
		localStorage.setItem("CXpass", ciphertext);
	}  
	if (document.getElementById("FgtCookie").checked) {
	  // document.cookie = "CXpass=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
	  localStorage.setItem("CXpass", "");
	}  
	createFilesDec(document.getElementById("Password").value);
	SelFile();
	document.getElementById("PwdFld").hidden = true;
}	
