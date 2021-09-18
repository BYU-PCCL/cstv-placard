const { ipcRenderer } = require("electron");
const QRCode = require("qrcode");

const lockImagePath = "img/lock_black_48dp.svg";

const titleElement = document.querySelector("#title");
const descriptionElement = document.querySelector("#description");
const artistElement = document.querySelector("#artist");
const qrImageElement = document.querySelector("#qr");
const slideableBackgroundElement = document.querySelector(
  "#slideable-background"
);
const qrBoxElement = document.querySelector("#qr-box");
const logoElement = document.querySelector("#logo");

const HIDE_TRANSLATE_X = "translateX(-100vw)";
const QR_BOX_SHADOW = "#11111199 0 4px 8px";

const createContainerWidthStyle = (widthPercent) =>
  `calc(${widthPercent}% - (var(--padding) * 2))`;

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

ipcRenderer.on("updateLayout", (event, layout) => {
  if (layout === "full") {
    slideableBackgroundElement.style.width = createContainerWidthStyle(100);
    slideableBackgroundElement.style.transform = "";
    qrBoxElement.style.boxShadow = "";
    qrBoxElement.style.transform = "";
    logoElement.style.transform = "";
    logoElement.style.opacity = "";
  } else if (layout === "slim") {
    slideableBackgroundElement.style.width = createContainerWidthStyle(60);
    slideableBackgroundElement.style.transform = "";
    qrBoxElement.style.boxShadow = "";
    logoElement.style.transform = `translateX(-${window.innerWidth * 1.5}px)`;
    logoElement.style.opacity = "0%";
  } else if (layout === "hidden") {
    slideableBackgroundElement.style.transform = HIDE_TRANSLATE_X;
    qrBoxElement.style.boxShadow = QR_BOX_SHADOW;
    qrBoxElement.style.transform = "";
    // window.innerWidth is kind of a random position, but we want it not to feel like it's
    // floating out when nothing else is
    logoElement.style.transform = `translateX(-${window.innerWidth * 1.5}px)`;
    logoElement.style.opacity = "0%";
  }
});

window.addEventListener("load", (event) => {
  setQRCode(null);
  updateExperience({
    title: "Loading...",
    description:
      "Hang tight for something cool!",
  });
});
