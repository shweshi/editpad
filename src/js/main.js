var cleanRequired;
var default_text = "Enter or paste your text here. To download and save it, click on the Download button.";
var fullScreen = 0;

function setCleanRequired(value) {
    cleanRequired = value;
}

function getRandomQuote() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200 && cleanRequired) {
            response = JSON.parse(this.responseText);
            document.getElementById("text").innerHTML = response.content + ' ~ ' + response.author;
        }
    };
    xhttp.open("GET", "https://api.quotable.io/random", true);
    xhttp.send();
}

function clearText() {
    document.textform.text.value = '';
}

var elem = document.documentElement;

function openFullscreen() {
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
        elem.msRequestFullscreen();
    }
    document.getElementById("fullScreen").style.display = "none";
    document.getElementById("closeFullScreen").style.display = "initial";
}

function closeFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
        document.msExitFullscreen();
    }
    document.getElementById("fullScreen").style.display = "initial";
    document.getElementById("closeFullScreen").style.display = "none";
}

function download() {
    var text = document.getElementById("text").value;
    text = text.replace(/\n/g, "\r\n"); // To retain the Line breaks.
    var blob = new Blob([text], { type: "text/plain" });
    var anchor = document.createElement("a");
    anchor.download = "text.txt";
    anchor.href = window.URL.createObjectURL(blob);
    anchor.target = "_blank";
    anchor.style.display = "none"; // just to be safe!
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
}

function clock() {
    var clockElement = document.getElementById('time');
    clockElement.textContent = new Date().toISOString();
}

setInterval(clock, 1000);

function toggleDayNight() {
    applyDarkMode();

    (localStorage.getItem("dark-mode") === 'true') ? localStorage.setItem("dark-mode", false) : localStorage.setItem("dark-mode", true);
}

function applyDarkMode() {
    var navbar = document.getElementById("navbar");
    navbar.classList.toggle("dark-mode-header");

    var buttons = document.getElementsByClassName("header-button");
    for (i = 0; i < buttons.length; i++) {
        buttons[i].classList.toggle("dark-mode-header-button");
    }

    var textarea = document.getElementById("text");
    textarea.classList.toggle("dark-mode-textarea");

    var anchors = document.getElementsByTagName('a');
    for (i = 0; i < anchors.length; i++) {
        anchors[i].classList.toggle("dark-mode-a");
    }

    var dropdown = document.getElementsByClassName("dropdown-content");
    for (i = 0; i < dropdown.length; i++) {
        dropdown[i].classList.toggle("dark-mode-dropdown-content");
    }

    var tooltip = document.getElementsByClassName("bottom");
    for (i = 0; i < dropdown.length; i++) {
        tooltip[i].classList.toggle("dark-mode-bottom");
    }

    var input = document.getElementsByClassName("input");
    for (i = 0; i < dropdown.length; i++) {
        input[i].classList.toggle("dark-mode-input");
    }
}

function checkDarkMode() {
    var darkMode = localStorage.getItem("dark-mode");
    if (darkMode === 'true') {
        applyDarkMode();
    }
}

function updateBackgroundColor(color) {
    document.getElementById("text").style.backgroundColor = color;
}

function updateFontColor(color) {
    document.getElementById("text").style.color = color;
}

function showMore() {
    document.getElementById("more-dropdown").classList.toggle("show");
}

function resizeText(multiplier) {
    if (document.getElementById("text").style.fontSize == "") {
        document.getElementById("text").style.fontSize = "1.0em";
    }
    document.getElementById("text").style.fontSize = parseFloat(document.getElementById("text").style.fontSize) + (multiplier * 0.2) + "em";
}

function printConsoleArt() {
    const consoleStr = `
    ███████ ██████  ██ ████████ ██████   █████  ██████  
    ██      ██   ██ ██    ██    ██   ██ ██   ██ ██   ██ 
    █████   ██   ██ ██    ██    ██████  ███████ ██   ██ 
    ██      ██   ██ ██    ██    ██      ██   ██ ██   ██ 
    ███████ ██████  ██    ██    ██      ██   ██ ██████  
                                                        
                        
    Github: https://github.com/shweshi/editpad
    `
    console.log(consoleStr);
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function (event) {
    if (event.target.matches('.font') || event.target.matches('.color-button')) {
        event.stopPropagation();
    } else {
        if (!event.target.matches('.dropbtn')) {
            var dropdowns = document.getElementsByClassName("dropdown-content");
            var i;
            for (i = 0; i < dropdowns.length; i++) {
                var openDropdown = dropdowns[i];
                if (openDropdown.classList.contains('show')) {
                    openDropdown.classList.remove('show');
                }
            }
        }
    }
}

function share() {
    var tooltip = document.getElementById('bottom');
    if (tooltip.style.display != 'block') {
        tooltip.style.display = 'block';
        const input = document.getElementById('shareLink');
        input.value = 'https://editpad.org?content=' + getEncodedContent();
        input.select();
    } else {
        tooltip.style.display = 'none';
    }
}

function getEncodedContent() {
    const content = document.getElementById("text").value;
    return btoa(content);
}

function copyToClipboard() {
    const content = document.getElementById("text");

    content.select();
    content.setSelectionRange(0, 99999); /* For mobile devices */
    document.execCommand("copy");

    var copied = document.getElementById('copied');
    if (copied.style.display != 'block') {
        copied.style.display = 'block';
    } else {
        copied.style.display = 'none';
    }
}