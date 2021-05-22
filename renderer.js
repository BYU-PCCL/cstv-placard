const { ipcRenderer } = require('electron')
const QRCode = require('qrcode')

const titleElement = document.querySelector("#title")
const descriptionElement = document.querySelector("#description")
const artistElement = document.querySelector("#artist")
const detailsContainerElement = document.querySelector("#details-container")
const qrCanvas = document.querySelector("#qr")

// https://stackoverflow.com/a/11765731/1979008
function setQRCode(url){
    const svg = QRCode.toString(url, {type: "svg"}, (error) => {
        if (error) alert(error)
    })
    console.log(svg)
    const blob = new Blob([svg], {type: 'image/svg+xml'});
    const imageUrl = URL.createObjectURL(blob);
    qrCanvas.crossOrigin = "Anonymous";
    qrCanvas.src = imageUrl
    qrCanvas.addEventListener('load', () => URL.revokeObjectURL(imageUrl), {once: true});
}

setQRCode("https://cs.byu.edu")

ipcRenderer.on('updateContent', (event, args) => {
    const {title, description, artist} = args;
    titleElement.innerHTML = title;
    descriptionElement.innerHTML = description;

    if (artist != null) {
        artistElement.style.display = "initial";
        artistElement.innerHTML = artist;
    } else {
        artistElement.style.display = "none";
    }
});

ipcRenderer.on('setVisibility', (event, visible) => {
    const translateX = `translateX(calc(var(--width) * -1))`;
    detailsContainerElement.style.transform = visible ? "" : translateX;
})

ipcRenderer.on('updateUrl', (event, args) => {
    setQRCode(args.url)
})
