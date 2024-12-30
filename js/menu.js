var menu = document.getElementById("menu");
menu.style.maxHeight = "0%";

function togglemenu() {

    if (menu.style.maxHeight == "0%") {
        menu.style.maxHeight = "18rem";
        menu.style.backgroundColor = "rgba(0, 0, 0, 1.0)";
    }
    else {
        menu.style.maxHeight = "0%";
    }
}
