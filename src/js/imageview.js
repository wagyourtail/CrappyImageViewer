const electron = require("electron");
const imageSize = require('image-size');
const fs = require("fs");
const ipc = electron.ipcRenderer;

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

