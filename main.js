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
let layout = "full";

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

  server.put("/layout", async (req, res) => {
    layout = await req.body?.layout;
    win.webContents.send("updateLayout", layout);
    res.status(200).json({ status: "ok" });
  });
  server.get("/layout", async (_, res) => {
    res.status(200).json({ layout: layout });
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
    width: 2736,
    height: 1216,
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
  win.setIgnoreMouseEvents(true);
}

if (process.platform === 'linux') {
  app.commandLine.appendSwitch('enable-transparent-visuals');
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
