var menu = document.getElementById("menu");

menu.style.maxHeight = "0%";

function togglemenu() {
    if (menu.style.maxHeight == "0%") {   
        menu.style.maxHeight = "50%";
    }
    else {
        menu.style.maxHeight = "0%";
    }
}

var CV_menu = document.getElementById("CV_menu");

CV_menu.style.maxHeight = "0%";

function toggleCV() {
    if (CV_menu.style.maxHeight == "0%") {
        CV_menu.style.maxHeight = "10%";
    }
    else {
        CV_menu.style.maxHeight = "0%";
    }
}
