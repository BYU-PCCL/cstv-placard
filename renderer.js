const { ipcRenderer } = require("electron");
const QRCode = require("qrcode");

const lockImagePath = "img/lock_black_48dp.svg";

const titleElement = document.querySelector("#title");
const descriptionElement = document.querySelector("#description");
const artistElement = document.querySelector("#artist");
const qrImageElement = document.querySelector("#qr");

// https://stackoverflow.com/a/11765731/1979008
function setQRCode(url) {
  if (url == null) {
    qrImageElement.src = lockImagePath;
    qrImageElement.classList.add("locked");
    return;
  }

  qrImageElement.classList.remove("locked");

  const svg = QRCode.toString(url, { type: "svg" }, (error) => {
    if (error) alert(error);
  });
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const imageUrl = URL.createObjectURL(blob);
  qrImageElement.crossOrigin = "Anonymous";
  qrImageElement.src = imageUrl;
  qrImageElement.addEventListener("load", () => URL.revokeObjectURL(imageUrl), {
    once: true,
  });
}

function updateExperience(experience) {
  const { title, description, artist } = experience;
  titleElement.innerHTML = title;
  descriptionElement.innerHTML = description;

  if (artist != null) {
    artistElement.style.display = "initial";
    artistElement.innerHTML = artist;
  } else {
    artistElement.style.display = "none";
  }
}

ipcRenderer.on("updateExperience", (event, args) => {
  updateExperience(args);
});

ipcRenderer.on("updateUrl", (event, url) => {
  setQRCode(url);
});

window.addEventListener('load', (event) => {
  setQRCode(null);
  updateExperience({title: "Starting", description: "Hang tight for something cool..."});
});
