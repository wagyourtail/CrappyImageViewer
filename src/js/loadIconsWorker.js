onmessage = (files) => {
    files = files.data;
    let imageIcons = [];
    for(let x = 0; x < files.length; x++) {
        imageIcons.push(`<div id="image-${x}" onClick="setImg(${x})"><center><img height="90px" width="90px"><p id="imagename-${x}">${files[x]}</p></center></div>`);
    }
    postMessage(imageIcons.join("\n"));
}
