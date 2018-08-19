const folderico = `<svg height="60.001px" id="Layer_1" style="enable-background:new 0 0 64 60.001;" version="1.1" viewBox="0 0 64 60.001" width="64px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="Folder"><g><path d="M60,4.001H24C24,1.792,22.209,0,20,0H4    C1.791,0,0,1.792,0,4.001V8v6.001v2c0,2.209,1.791,4,4,4h56c2.209,0,4-1.791,4-4V8C64,5.791,62.209,4.001,60,4.001z" style="fill-rule:evenodd;clip-rule:evenodd;fill:#CCA352;"/></g></g><g id="File_1_"><g><path d="M56,8H8c-2.209,0-4,1.791-4,4.001v4c0,2.209,1.791,4,4,4h48c2.209,0,4-1.791,4-4v-4    C60,9.791,58.209,8,56,8z" style="fill:#FFFFFF;"/></g></g><g id="Folder_1_"><g><path d="M60,12.001H4c-2.209,0-4,1.791-4,4v40c0,2.209,1.791,4,4,4h56c2.209,0,4-1.791,4-4v-40    C64,13.792,62.209,12.001,60,12.001z" style="fill:#FFCC66;"/></g></g><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/></svg>`;
const electron = require("electron");
const ipc = electron.ipcRenderer;

let scrollFn = () => {}

ipc.on("dir", (e, data) => {
    let innerData = [];
    let { fileList, dir } = data;
    fileList.dirs.forEach((dir, i) => {
        innerData.push(`<div id="dir-${i}" onClick="ipc.sendToHost('chdir', '${dir}')"><center><img class="imageIcon" height="90px" width="90px">${folderico}</img><p>${dir}</p></center></div>`);
    });
    data.fileList.files.forEach((file, i) => {
        innerData.push(`<div id="image-${i}" onClick="ipc.sendToHost('setImg', ${i})"><center><img class="imageIcon" height="90px" width="90px" alt="${dir}/${file}"><p>${file}</p></center></div>`);
    });
    scrollbox.innerHTML = innerData.join("\n");

    scrollFn = () => {
        let scrollDistance = window.scrollX;
        let a = Math.floor((scrollDistance-10)/138)+(138*fileList.dirs.length);
        for (let x = a-50; x < a+window.innerWidth/138+40; x++) {
            if (x > -1 && x < fileList.files.length) {
                if (Math.abs(a-x) < 25) {
                    document.getElementById(`image-${x}`).innerHTML = document.getElementById(`image-${x}`).innerHTML.replace("alt=", "src=");
                } else {
                    document.getElementById(`image-${x}`).innerHTML = document.getElementById(`image-${x}`).innerHTML.replace("src=", "alt=");
                }
            }
        }
    }

    ipc.on("scrollTo", (e, item) => {
        window.scrollTo(item*138+fileList.dirs.length*138+40, window.scrollY);
        scrollFn();
    });
});



window.addEventListener("mousewheel", (e) => {
    e = window.event || e;
    let delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
    window.scrollLeft += (delta*40); // Multiplied by 40
    e.preventDefault();
    scrollFn();
});

window.addEventListener("scroll", ()=> {scrollFn()});
window.onchange(scrollFn);