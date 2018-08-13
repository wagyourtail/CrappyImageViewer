const electron = require("electron");
const imageSize = require('image-size');
const fs = require("fs");
const remote = electron.remote;
const dir = remote.getGlobal("dir");
const dirList = fs.readdirSync(dir);
let directorys = [];
let files = [];
console.log(remote.BrowserWindow.isOffscreen);


document.getElementById("title").innerHTML = dir;

dirList.forEach(x => {
    if (fs.statSync(`${dir}/${x}`).isDirectory()) {
        directorys.push(x);
    } else {
        files.push(x);
    }
});


let loadIcons = new Worker("../js/loadIconsWorker.js");
loadIcons.onmessage = (imageIcons) => {
    imageIcons = imageIcons.data;
    document.getElementById("imageIcons").innerHTML = imageIcons;
    scrollFn();
}
loadIcons.postMessage({dir:dir, files:files});




let shuffle = () => {
    for (let i = files.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [files[i], files[j]] = [files[j], files[i]];
        [document.getElementById(`image-${i}`).innerHTML, document.getElementById(`image-${j}`).innerHTML] = [document.getElementById(`image-${j}`).innerHTML.replace("src=", "alt="), document.getElementById(`image-${i}`).innerHTML.replace("src=", "alt=")];
    }
    scrollFn();
}


let currentImg = 0;

let setImg = (num) => {
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


window.addEventListener("keydown", (key) => {
    if (key.key == "ArrowLeft" && currentImg > 0) {
        setImg(currentImg-1);
    } else if (key.key =="ArrowRight" && currentImg < files.length-1) {
        setImg(currentImg+1);
    } else if (key.key == "F7"){
        shuffle();
    }
});


setImg(0);


document.getElementById("minBtn").addEventListener("click", () => {remote.BrowserWindow.getFocusedWindow().minimize()});
document.getElementById("maxBtn").addEventListener("click", () => {
    let fullscreen = remote.BrowserWindow.getFocusedWindow().isFullScreen();
    remote.BrowserWindow.getFocusedWindow().setFullScreen(!fullscreen);
    document.getElementById("topbar").setAttribute("style", fullscreen ? "height: 20px;" : "");
    document.getElementById("title").setAttribute("style", fullscreen ? "-webkit-app-region: drag;" : "");
});
document.getElementById("closeBtn").addEventListener("click", window.close);




document.getElementById("imageIcons").addEventListener("mousewheel", (e) => {
    e = window.event || e;
    let delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
    document.getElementById('imageIcons').scrollLeft += (delta*40); // Multiplied by 40
    e.preventDefault();
});

document.getElementById("topbarContainer").addEventListener("mouseover", () => {
    document.getElementById("imageIcons").scrollLeft = currentImg*138;
});


const resizeFn = () => {
    document.getElementById("currentImg").setAttribute("height", window.innerHeight);
    document.getElementById("currentImg").setAttribute("width", window.innerWidth);
}

const scrollFn = () => {
    let scrollDistance = document.getElementById("imageIcons").scrollLeft;
    let a = Math.floor((scrollDistance-10)/138);
    for (let x = a-50; x < a+window.innerWidth/138+50; x++) {
        if (x > -1) {
            if (Math.abs(a-x) < 25) {
                document.getElementById(`image-${x}`).innerHTML = document.getElementById(`image-${x}`).innerHTML.replace("alt=", "src=");
            } else {
                document.getElementById(`image-${x}`).innerHTML = document.getElementById(`image-${x}`).innerHTML.replace("src=", "alt=");
            }
        }
    }
}
imageIcons.addEventListener("scroll", scrollFn);
window.addEventListener("resize", resizeFn);
resizeFn();
