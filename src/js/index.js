const electron = require("electron");
const path = require("path");
const fs = require("fs");
const remote = electron.remote;
let dir = "";
let fileList = {files: [], dirs: []};
let currentImage = 0;


// ---- Topbar ---- //


let loadTopbar = () => {
    topbarLoad.stop();
    topbarLoad.reload();
}
let scrollTo = (i) => {

}
topbarLoad.addEventListener("dom-ready", () => {
    topbarLoad.send("dir", {dir:dir, fileList:fileList});
    scrollTo = (i) => {
        topbarLoad.send("scrollTo", i);
    }
    scrollTo(currentImage);
});

topbarLoad.addEventListener("ipc-message", (e) => {
    if(e.channel == "setImg") {
        setImg(e.args[0]);
    } else if (e.channel = "chdir") {
        console.log(`${dir}/${e.args[0]}`)
        setDir([`${dir}/${e.args[0]}`]);
    }
});

// ---- main image ---- //


let sendData = {};
let sendImageRender = (data) => {
    sendData = data;
}

let changeZoom = (num) => {

}

imageviewLoad.addEventListener("dom-ready", () => {
    imageviewLoad.send("setImage", sendData);
    sendImageRender = (data) => {
        imageviewLoad.send("setImage", data);
    }
    sendData = null;
    changeZoom = (num) => {
        imageviewLoad.send("changeZoom", num/100);
    }
});







imageview.addEventListener("keydown", (key) => {
    if (key.key == "ArrowLeft" && currentImage > 0) {
        setImg(currentImage-1);
    } else if (key.key =="ArrowRight" && currentImage < fileList.files.length-1) {
        setImg(currentImage+1);
    } else if (key.key == "F7") {
        shuffle();
    }
});

// ---- bottombar ---- //

zoomInput.addEventListener("change", () => {
    zoomSlide.value = zoomInput.value;
    changeZoom(zoomInput.value);
});

zoomSlide.addEventListener("change", () => {
    zoomInput.value = zoomSlide.value;
    changeZoom(zoomInput.value);
});


// ---- mainWindow Controls ---- //

minBtn.addEventListener("click", () => {remote.BrowserWindow.getFocusedWindow().minimize()});
maxBtn.addEventListener("click", () => {
    let fullscreen = remote.BrowserWindow.getFocusedWindow().isFullScreen();
    remote.BrowserWindow.getFocusedWindow().setFullScreen(!fullscreen);
    topbar.setAttribute("style", fullscreen ? "height: 20px;" : "");
    title.setAttribute("style", fullscreen ? "-webkit-app-region: drag;" : "");
    imageview.setAttribute("style", fullscreen ? "margin-top: 20px;" : "")
    imageviewLoad.style.height= `${fullscreen ? window.innerHeight-20 : window.innerHeight}px`
});
closeBtn.addEventListener("click", window.close);

imageview.style.height= `${window.innerHeight}px`;
window.addEventListener("resize", () => {
    let fullscreen = remote.BrowserWindow.getFocusedWindow().isFullScreen();
    imageviewLoad.style.height= `${fullscreen ? window.innerHeight : window.innerHeight-20}px`;
});

const setDir = (d) => {
    dir = fs.statSync(d[0]).isDirectory() ? d[0] : path.dirname(d[0]);
    title.innerHTML = dir;
    fileList = {files: [], dirs: []};
    fs.readdir(dir, (err, files) => {
        if (err) {
            alert(err);
        }
        files.forEach((file) => {
            try {
            fileList[fs.statSync(`${dir}/${file}`).isDirectory() ? "dirs" : "files"].push(file);
            } catch(e) {
                console.log(e);
            }
        });
        if (fs.statSync(d[0]).isFile()) {
            setImg(fileList.files.indexOf(path.basename(d[0])));
        } else {
            setImg(0);
        }
        loadTopbar();
    });
}

const setImg = (img) => {
    currentImage = img;
    sendImageRender({dir:dir, str:fileList.files[currentImage], pos:`${currentImage+1} / ${fileList.files.length}`});
    scrollTo(currentImage);
}

const shuffle = () => {
    for (let i = fileList.files.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [fileList.files[i], fileList.files[j]] = [fileList.files[j], fileList.files[i]];
        if(i == currentImage) {
            setImg(j);
        } else if (j == currentImage) {
            setImg(i);
        }
    }
    loadTopbar();
}


 
title.addEventListener("click" , () => {
    let d = remote.dialog.showOpenDialog(remote.BrowserWindow.getFocusedWindow(), {properties: ['openDirectory']});
    setDir(d);
});
setDir([remote.getGlobal("dir")]);

