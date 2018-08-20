const electron = require("electron");
const imageSize = require('image-size');
const fs = require("fs");
const ipc = electron.ipcRenderer;

let scale = 2;
let mousedown = false;
ipc.on("changeZoom", (e, data) => {
    scale = data;
});

imageSrc.addEventListener("mousedown", (event) => {
    imageSrc.style.width = `${window.innerWidth*scale}px`;
    imageSrc.style.height = `${window.innerHeight*scale}px`;
    window.scrollTo(event.clientX*(scale-1), event.clientY*(scale-1));
    mousedown = true;
});

imageSrc.addEventListener("mouseup", () => {
    imageSrc.style.width = null;
    imageSrc.style.height = null;
    mousedown = false;
});

window.addEventListener("mousemove", (event) => {
    if(mousedown) {
        window.scrollTo(event.clientX*(scale-1), event.clientY*(scale-1));
    }
});

ipc.on("setImage", (e, data) => {
    let {dir, str, pos} = data;
    imageSize(`${dir}/${str}`, (err,info) => {
        if(info) {
            imageSrc.src = `${dir}/${str}`;
            imageText.innerHTML = `${str} (${info.width} x ${info.height} | ${Math.floor((info.width*info.height)/10000)/100} MP) ${parseInt(fs.statSync(`${dir}/${str}`).size/1024)} KiB  [${pos}]`;
        } else {
            imageSrc.src = `${dir}/${str}`;
            imageText.innerHTML = `${str} ${parseInt(fs.statSync(`${dir}/${str}`).size/1024)} KiB  [${pos}]`;
        }
    });
});

