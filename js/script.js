var menu = document.getElementById("menu");

menu.style.maxHeight = "Opx";

function togglemenu() {
    if (menu.style.maxHeight == "0px") {   
        menu.style.maxHeight = "50vh";
    }
    else {
        menu.style.maxHeight = "0px";
    }
}