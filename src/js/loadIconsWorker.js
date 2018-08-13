onmessage = (data) => {
    let {dir, files} = data.data;
    let imageIcons = [];
    for(let x = 0; x < files.length; x++) {
        imageIcons.push(`<div id="image-${x}" onClick="setImg(${x})"><center><img class="imageIcon" height="90px" width="90px" alt="${dir}/${files[x]}"><p>${files[x]}</p></center></div>`);
    }
    setTimeout(() => {postMessage(imageIcons.join("\n"))}, 10000);
}
