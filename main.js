const { app, BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");
const express = require("express");

const { env } = process;
const runtimePath = path.join(env.XDG_RUNTIME_DIR, "placard");
const socketPath = path.join(runtimePath, "socket");

let win;

const experience = {
  title: "Starting...",
  description: null,
  artist: null,
};

let url = null;
let visible = true;

async function createServer() {
  const server = express();
  server.use(express.json());

  server.put("/experience", async (req, res) => {
    const body = await req.body;

    for (let key in experience) {
      experience[key] = body[key] ?? null;
    }

    win.webContents.send("updateExperience", experience);
    res.status(200).json({ status: "ok" });
  });
  server.get("/experience", async (_, res) => {
    res.status(200).json(experience);
  });

  server.put("/url", async (req, res) => {
    url = await req.body?.url;
    win.webContents.send("updateUrl", url);
    res.status(200).json({ status: "ok" });
  });
  server.get("/url", async (_, res) => {
    res.status(200).json({ url: url });
  });

  server.put("/visibility", async (req, res) => {
    visible = await req.body?.visible;
    win.webContents.send("updateVisibility", visible);
    res.status(200).json({ status: "ok" });
  });
  server.get("/visibility", async (_, res) => {
    res.status(200).json({ visible: visible });
  });

  if (!fs.existsSync(runtimePath)) {
    fs.mkdirSync(runtimePath);
  } else if (fs.existsSync(socketPath)) {
    // It's probably a bad practice to just delete the file but it should work practically
    fs.rmSync(socketPath);
  }

  server.listen(socketPath);
}

async function createWindow() {
  win = new BrowserWindow({
    frame: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  win.setAlwaysOnTop(true, "floating");

  await win.loadFile("index.html");

  win.webContents.send("updateContent", experience);
}

app.whenReady().then(() => {
  setTimeout(async function () {
    await createWindow();
    await createServer();
  }, 1000);
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
