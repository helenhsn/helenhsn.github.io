var menu = document.getElementById("menu");

menu.style.maxHeight = "O%";

function togglemenu() {
    if (menu.style.maxHeight == "0%") {   
        menu.style.maxHeight = "40%";
    }
    else {
        menu.style.maxHeight = "0%";
    }
}