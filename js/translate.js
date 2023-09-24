function Translate() { 
	//initialization
	this.init =  function(attribute, lang){
		this.attribute = attribute;
		this.lang = lang;	
	}
	//translatation
	this.process = function(){
		_self = this;
		var xrhFile = new XMLHttpRequest();
		//load content data 
		xrhFile.open("GET", "/language/" + this.lang + ".json", false);
		xrhFile.onreadystatechange = function ()
		{
			if(xrhFile.readyState === 4)
			{
				if(xrhFile.status === 200 || xrhFile.status == 0)
				{
					var LngObject = JSON.parse(xrhFile.responseText);
					var allDom = document.getElementsByTagName("*");
					for(var i =0; i < allDom.length; i++){
						var elem = allDom[i];
						var key = elem.getAttribute(_self.attribute);
						if(key != null) {
							elem.innerHTML = LngObject[key]  ;
						}
					}
				
				}
			}
		}
		xrhFile.send();
    }
}

//function called when clicking on FR or UK flags
function translate_fct(lang, tagAttr){
    var translator = new Translate();
    translator.init(tagAttr, lang);
    translator.process();

}

var default_lang = 'en';

function init_lang(tagAttr) {
	let selected_lang = sessionStorage.getItem('lang');
	if (!selected_lang) {
		selected_lang = default_lang;
		sessionStorage.setItem('lang', selected_lang);
	}
	translate_fct(selected_lang, tagAttr)
}

function change_lang(lang, tagAttr) {
	let selected_lang = sessionStorage.getItem('lang');
	if (lang != selected_lang) {
		selected_lang = lang;
		sessionStorage.setItem('lang', selected_lang);
		translate_fct(selected_lang, tagAttr);
	}
}
