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
const qrHintContentContainerElement = document.querySelector(
  "#qr-hint-content-container"
);
const qrHintContentElement = document.querySelector("#qr-hint-content");
const qrHintContentHeightElement = document.querySelector("#qr-hint-content-height");
const qrHintIconElement = document.querySelector("#qr-hint-icon");

const FULL_WIDTH = 574;
const HIDE_TRANSLATE_X = `translateX(-${FULL_WIDTH + 4}px)`;

import { Gradient } from "./scripts/Gradient.js";

const createContainerWidthStyle = (widthPercent) =>
  `${FULL_WIDTH * widthPercent}px`;

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
    artistElement.style.display = "";
    artistElement.innerHTML = artist;
  } else {
    artistElement.style.display = "none";
  }

}

function updateActionHints(hints) {
  window.experienceActionHints = hints ?? [];
  window.experienceActionHintsShuffle = [];
  window.showingActionHint = true;

  updateQrHint()
}

ipcRenderer.on("updateExperience", (event, args) => {
  updateExperience(args);
});

ipcRenderer.on("updateActionHints", (event, hints) => {
  updateActionHints(hints);
});

ipcRenderer.on("updateUrl", (event, url) => {
  setQRCode(url);
});

ipcRenderer.on("updateLayout", (event, layout) => {
  if (layout === "full") {
    slideableBackgroundElement.style.width = createContainerWidthStyle(1);
    slideableBackgroundElement.style.transform = "";
    qrBoxElement.style.transform = "";
  } else if (layout === "slim") {
    slideableBackgroundElement.style.width = createContainerWidthStyle(0.6);
    slideableBackgroundElement.style.transform = "";
  } else if (layout === "hidden") {
    slideableBackgroundElement.style.transform = HIDE_TRANSLATE_X;
    qrBoxElement.style.transform = "";
    // window.innerWidth is kind of a random position, but we want it not to feel like it's
    // floating out when nothing else is
  }
});

window.addEventListener("load", (event) => {
  setQRCode(null);
  updateExperience({
    title: "Loading...",
    description: "Hang tight for something cool!",
  });
});

window.addEventListener("load", init);

function pullFromShuffle(original, shuffle) {
  if (!original.length) {
    return undefined;
  }
  if (!shuffle.length) {
    shuffle.push(...original);
  }
  const index = Math.floor(Math.random() * shuffle.length);
  const item = shuffle[index];
  shuffle.splice(index, 1);
  return item;
}

async function updateQrHint() {
  let shuffleItem;
  let showActionName = false;

  if (window.showingActionHint) {
    shuffleItem = pullFromShuffle(experienceActionHints, experienceActionHintsShuffle);
    if (shuffleItem) {
      showActionName = true;
    } else {
      shuffleItem = "control<br>this experience"
    }
  } else {
    shuffleItem = "explore other experiences"
  }

  window.showingActionHint = !window.showingActionHint;

  if (shuffleItem !== qrHintContentElement.innerHTML) {
    qrHintContentElement.style.opacity = "0";
  }

  setTimeout(() => {
    qrHintContentElement.innerHTML = shuffleItem;
    if (showActionName) {
      qrHintContentElement.classList.add("action-name");
    } else {
      qrHintContentElement.classList.remove("action-name");
    }
    qrHintContentContainerElement.style.height = `${qrHintContentHeightElement.scrollHeight}px`;
  }, 600);
  setTimeout(() => {
    qrHintContentElement.style.opacity = "1";
  }, 1000);
}

async function init() {
  const gradient = new Gradient();

  gradient.initGradient("#qr-bg-canvas");

  window.experienceActionHints = [];
  window.experienceActionHintsShuffle = [];
  window.showingActionHint = false;

  qrHintContentContainerElement.style.height = `${qrHintContentHeightElement.offsetHeight}px`;

  await updateQrHint()
  setInterval(updateQrHint, 10000);
}
