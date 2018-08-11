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


let setImg = (str) => {
        imageSize(`${dir}/${str}`, (err,info) => {
            const currentImg = document.getElementById("currentImg");
            if(info) {
                currentImg.setAttribute("src", `${dir}/${str}`);
                document.getElementById("info").innerHTML = `${str} (${info.width} / ${info.height}) ${parseInt(fs.statSync(`${dir}/${str}`).size/1024)} KiB`;
            } else {
                currentImg.setAttribute("src", `${dir}/${str}`);
                document.getElementById("info").innerHTML = `${str} ${parseInt(fs.statSync(`${dir}/${str}`).size/1024)} KiB`;
            }
        });
}



 let setImgIcons = async () => {
    return new Promise((resolve, reject) => {
        let imageIcons = document.getElementById("imageIcons");
        for(let x = 0; x < files.length; x++) {
            imageIcons.innerHTML = `${imageIcons.innerHTML}\n<div id="image-${x}"><center><img height="90px" width="90px"><p id="imagename-${x}">${files[x]}</p></center></div>`
        }
    });
}

//setImgIcons();


let currentImg = 0;

let shuffle = () => {
    for (let x = 0; x < files.length; x++) {
        
    }
};

window.addEventListener("keydown", (key) => {
    if (key.key == "ArrowLeft" && currentImg > 0) {
        currentImg--;
        setImg(files[currentImg]).catch(console.log);
    } else if (key.key =="ArrowRight" && currentImg < files.length-1) {
        currentImg++;
        setImg(files[currentImg]).catch(console.log);
    } else if (key.key == "F7"){
        shuffle();
    }
});


setImg(files[0]);


document.getElementById("minBtn").addEventListener("click", () => {remote.BrowserWindow.getFocusedWindow().minimize()});
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
