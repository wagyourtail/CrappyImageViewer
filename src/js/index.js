const electron = require("electron");
const imageSize = require('image-size');
const fs = require("fs");
const remote = electron.remote;
const dir = remote.getGlobal("dir");
const dirList = fs.readdirSync(dir);
let directorys = [];
let files = [];

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
}
loadIcons.postMessage(files);




let shuffle = () => {
    let imageIcons = document.getElementById("imageIcons").innerHTML.split("\n");
    for (let i = files.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [files[i], files[j]] = [files[j], files[i]];
        [imageIcons[i], imageIcons[j]] = [imageIcons[j].replace(`setImg(${j})`, `setImg(${i})`), imageIcons[i].replace(`setImg(${i})`, `setImg(${j})`)];
    }

    document.getElementById("imageIcons").innerHTML = imageIcons.join("\n");
}


let currentImg = 0;

let setImg = (num) => {
    let str = files[num];
    currentImg = num;
    imageSize(`${dir}/${str}`, (err,info) => {
        const currentImg = document.getElementById("currentImg");
        if(info) {
            currentImg.setAttribute("src", `${dir}/${str}`);
            document.getElementById("info").innerHTML = `${str} (${info.width} x ${info.height} | ${info.width*info.height} MP) ${parseInt(fs.statSync(`${dir}/${str}`).size/1024)} KiB  [${currentImg+1} / ${files.length}]`;
        } else {
            currentImg.setAttribute("src", `${dir}/${str}`);
            document.getElementById("info").innerHTML = `${str} ${parseInt(fs.statSync(`${dir}/${str}`).size/1024)} KiB  [${currentImg+1} / ${files.length}]`;
        }
    });
}


window.addEventListener("keydown", (key) => {
    if (key.key == "ArrowLeft" && currentImg > 0) {
        setImg(currentImg-1)
    } else if (key.key =="ArrowRight" && currentImg < files.length-1) {
        setImg(currentImg+1)
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






const resizeFn = () => {
    document.getElementById("currentImg").setAttribute("height", window.innerHeight);
    document.getElementById("currentImg").setAttribute("width", window.innerWidth);
}


window.addEventListener("resize", resizeFn);
window.addEventListener("move", (info) => {
    console.log(`move${info}`);
});
resizeFn();
