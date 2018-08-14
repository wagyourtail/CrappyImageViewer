const electron = require("electron");
const imageSize = require('image-size');
const fs = require("fs");
const path = require("path");
const remote = electron.remote;
let dir = "";
let directorys = [];
let files = [];
let currentImg = 0;

const loadIcons = new Worker("../js/loadIconsWorker.js");
loadIcons.onmessage = (icons) => {
    document.getElementById("imageIcons").innerHTML = icons.data;
    scrollFn();
}

// ---------- FUNCTIONS ---------- //
const shuffle = () => {
    for (let i = files.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [files[i], files[j]] = [files[j], files[i]];
        [document.getElementById(`image-${i}`).innerHTML, document.getElementById(`image-${j}`).innerHTML] = [document.getElementById(`image-${j}`).innerHTML.replace("src=", "alt="), document.getElementById(`image-${i}`).innerHTML.replace("src=", "alt=")];
        if(i == currentImg) {
            setImg(j);
        } else if (j == currentImg) {
            setImg(i);
        }
    }
    scrollFn();
    alert("shuffle finished!");
}


const setImg = (num) => {
    let str = files[num];
    currentImg = num;
    imageSize(`${dir}/${str}`, (err,info) => {
        const currentImg = document.getElementById("currentImg");
        if(info) {
            currentImg.setAttribute("src", `${dir}/${str}`);
            document.getElementById("info").innerHTML = `${str} (${info.width} x ${info.height} | ${Math.floor((info.width*info.height)/10000)/100} MP) ${parseInt(fs.statSync(`${dir}/${str}`).size/1024)} KiB  [${num+1} / ${files.length}]`;
        } else {
            currentImg.setAttribute("src", `${dir}/${str}`);
            document.getElementById("info").innerHTML = `${str} ${parseInt(fs.statSync(`${dir}/${str}`).size/1024)} KiB  [${num+1} / ${files.length}]`;
        }
    });
}

const resizeFn = () => {
    document.getElementById("currentImg").setAttribute("height", window.innerHeight);
    document.getElementById("currentImg").setAttribute("width", window.innerWidth);
}

const scrollFn = () => {
    let scrollDistance = imageIcons.scrollLeft;
    let a = Math.floor((scrollDistance-10)/138);
    for (let x = a-50; x < a+window.innerWidth/138+50; x++) {
        if (x > -1 && x < files.length) {
            if (Math.abs(a-x) < 25) {
                document.getElementById(`image-${x}`).innerHTML = document.getElementById(`image-${x}`).innerHTML.replace("alt=", "src=");
            } else {
                document.getElementById(`image-${x}`).innerHTML = document.getElementById(`image-${x}`).innerHTML.replace("src=", "alt=");
            }
        }
    }
}

const setFolder = (d) => {
    if (d && d[0]) {
        dir = fs.statSync(d[0]).isDirectory() ? d[0] : path.dirname(d[0]);
        files = [];
        directorys = [];
        let dirList = fs.readdirSync(dir);
        
        imageIcons.innerHTML = "";
        title.innerHTML = dir;
        dirList.forEach(x => {
            if (fs.statSync(`${dir}/${x}`).isDirectory()) {
                directorys.push(x);
            } else {
                files.push(x);
            }
        });

        loadIcons.postMessage({dir:dir, files:files});

        if (fs.statSync(d[0]).isFile()) {
            setImg(files.indexOf(path.basename(d[0])));
        } else {
            setImg(0);
        }
    }
}

// ----------- EVENTS ----------- //


window.addEventListener("keydown", (key) => {
    if (key.key == "ArrowLeft" && currentImg > 0) {
        setImg(currentImg-1);
    } else if (key.key =="ArrowRight" && currentImg < files.length-1) {
        setImg(currentImg+1);
    } else if (key.key == "F7"){
        shuffle();
    }
});



minBtn.addEventListener("click", () => {remote.BrowserWindow.getFocusedWindow().minimize()});
maxBtn.addEventListener("click", () => {
    let fullscreen = remote.BrowserWindow.getFocusedWindow().isFullScreen();
    remote.BrowserWindow.getFocusedWindow().setFullScreen(!fullscreen);
    topbar.setAttribute("style", fullscreen ? "height: 20px;" : "");
    title.setAttribute("style", fullscreen ? "-webkit-app-region: drag;" : "");
});
closeBtn.addEventListener("click", window.close);




imageIcons.addEventListener("mousewheel", (e) => {
    e = window.event || e;
    let delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
    imageIcons.scrollLeft += (delta*40); // Multiplied by 40
    e.preventDefault();
});

topbar.addEventListener("mouseenter", () => {
    imageIcons.scrollLeft = currentImg*138;
});

imageIcons.addEventListener("scroll", scrollFn);
window.addEventListener("resize", resizeFn);

title.addEventListener("click" , () => {
    let d = remote.dialog.showOpenDialog(remote.BrowserWindow.getFocusedWindow(), {properties: ['openDirectory']});
    setFolder(d);
});

// ----- MAIN CODE ----- //

setFolder([remote.getGlobal("dir")]);
resizeFn();
