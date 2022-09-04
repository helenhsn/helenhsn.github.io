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
function translate(lang, tagAttr){
    var translate = new Translate();
    translate.init(tagAttr, lang);
    translate.process();
}

$(document).ready(function(){
  //HTML element (English) with attribute lang-tag
  $("#enTranslator").click(function(){
    translate('en', 'lang-tag');
  });
  //HTML element (French) with attribute lang-tag
  $("#frTranslator").click(function(){
    translate('fr', 'lang-tag');
  });
});