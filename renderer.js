const { ipcRenderer } = require('electron')

const titleElement = document.querySelector("#title")
const descriptionElement = document.querySelector("#description")
const artistElement = document.querySelector("#artist")
const detailsContainerElement = document.querySelector("#details-container")

ipcRenderer.on('updateContent', (event, args) => {
    const {title, description, artist} = args;
    titleElement.innerHTML = title;
    descriptionElement.innerHTML = description;

    artistElement.style.visibility = artist == null ? "visible" : "hidden";

    if (artist != null) {
        artistElement.style.visibility = "visible";
        artistElement.innerHTML = artist;
    } else {
        artistElement.style.visibility = "hidden";
    }
});

ipcRenderer.on('setVisibility', (event, visible) => {
    const translateX = `translateX(calc(var(--width) * -1))`;
    detailsContainerElement.style.transform = visible ? "" : translateX;
})

ipcRenderer.on('updateUrl', (event, args) => {

})