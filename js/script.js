var menu = document.getElementById("menu");

menu.style.maxHeight = "0%";

function togglemenu() {
    console.log('toggle menu');
    if (menu.style.maxHeight == "0%") {   
        menu.style.maxHeight = "50%";
    }
    else {
        menu.style.maxHeight = "0%";
    }
}

