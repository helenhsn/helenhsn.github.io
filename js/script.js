var menu = document.getElementById("menu");

menu.style.maxHeight = "Opx";

function triggermenu() {
    if (menu.style.maxHeigh == "0px") {   
        menu.style.maxHeight = "150px";
    }
    else {
        menu.style.maxHeight = "0px";
    }
}