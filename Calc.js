// Calc
	//function that display value 
	function dis(val) {
		document.getElementById("result").value+=val
	} 
		
	//function that evaluates the digit and return result 
	function solve() {
		let x = document.getElementById("result").value;
		if (eval(x)!=undefined) {
			let y = eval(x).toFixed(2);
			if (y!=undefined && y!=Infinity) {
				document.getElementById("result").value = y;
				document.getElementById(OpenFrom).value = y;
				ShowAnim("CalcSp");
			}
		}
		if (x == "") document.getElementById(OpenFrom).value = "";
	} 
		
	//function that clear the display 
	function clr() {
		document.getElementById("result").value = "";
	}
