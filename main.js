const {app, BrowserWindow} = require('electron')
const path = require('path')
const fs = require('fs')
const express = require('express')

const {env} = process;
const runtimePath = path.join(env.XDG_RUNTIME_DIR, "placard")
const socketPath = path.join(runtimePath, "socket")

let win;

async function createServer() {
    const server = express();
    server.use(express.json())
    server.post("/show", (_req, res) => {
        win.webContents.send('setVisibility', true);
        win.webContents.send('setVisibility', "Test");
        res.status(200).json({status:"ok"})
    })
    server.post("/hide", (_req, res) => {
        win.webContents.send('setVisibility', false);
        res.status(200).json({status:"ok"})
    })
    server.post("/content", async (req, res) => {
        const body = await req.body
        win.webContents.send('updateContent', body);
        res.status(200).json({status:"ok"})
    })

    if (!fs.existsSync(runtimePath)) {
        fs.mkdirSync(runtimePath)
    } else if (fs.existsSync(socketPath)) {
        // It's probably a bad practice to just delete the file but it should work practically
        fs.rmSync(socketPath)
    }

    server.listen(socketPath)
}

async function createWindow() {
    win = new BrowserWindow({
        width: 1920,
        height: 1080,
        frame: false,
        transparent: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            preload: path.join(__dirname, 'preload.js')
        }
    })
    win.setAlwaysOnTop(true, 'floating')
    win.setIgnoreMouseEvents(true, {forward: true})

    win.loadFile('index.html').then(() => {
        if (app.commandLine.getSwitchValue("uuid")) {
            win.setTitle(app.commandLine.getSwitchValue("uuid"))
        }
    })
}

app.whenReady().then(() => {
    setTimeout(async function () {
        await createWindow();
        await createServer();
    }, 1000);
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
