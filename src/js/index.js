const electron = require("electron");
const fs = require("fs");
const remote = electron.remote;
const dir = remote.getGlobal("dir");
const dirList = fs.readdirSync(dir);
let directorys = [];
let files = [];

dirList.forEach(x => {
    if (fs.statSync(`${dir}/${x}`).isDirectory()) {
        directorys.push(x);
    } else {
        files.push(x);
    }
});


