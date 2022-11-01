var menu = document.getElementById("menu");

menu.style.maxHeight = "0%";

function togglemenu() {
    if (menu.style.maxHeight == "0%") {   
        menu.style.maxHeight = "15rem";
    }
    else {
        menu.style.maxHeight = "0%";
    }
}
