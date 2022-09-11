
var CV_menu = document.getElementById("CV_menu");
var CV_button = document.getElementById("CV");
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

const mediaQuery = window.matchMedia('(max-width:1000px');

function toggleCV() {
    if (CV_menu.style.maxHeight == "0rem") {
        CV_menu.style.maxHeight = "50rem";
        changevar(FR.style, initial_values);
        changevar(EN.style, initial_values);
        if (mediaQuery.matches) {

            CV_button.style.backgroundColor = 'var(--cv-color-click)';
        }
    }
    else {
        CV_menu.style.maxHeight = "0rem";
        changevar(FR.style, null_array);
        changevar(EN.style, null_array);
        if (mediaQuery.matches) {
            CV_button.style.backgroundColor = 'var(--light-color)';
        }
    }
}