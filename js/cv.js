var CV_menu = document.getElementById("CV_menu");
var CV_button = document.getElementById("CV_button");
var FR = document.getElementById("FR");
var EN = document.getElementById("EN");

CV_menu.style.maxHeight = "0rem";

let initial_values = [FR.style.height, FR.style.padding, FR.style.margin];
var initial_color = CV_button.style.backgroundColor;
let null_array = ["0", "0", "0"];

changevar(FR.style, null_array);
changevar(EN.style, null_array);

function changevar(style, let) {
    style.height = let[0];
    style.padding = let[1];
    style.margin = let[2];
}

function toggleCV() {
    if (CV_menu.style.maxHeight == "0rem") {
        CV_menu.style.maxHeight = "50rem";
        changevar(FR.style, initial_values);
        changevar(EN.style, initial_values);
        
    }
    else {
        CV_menu.style.maxHeight = "0rem";
        changevar(FR.style, null_array);
        changevar(EN.style, null_array);
        CV_button.style.backgroundColor = "#f3a48c";

    }
}