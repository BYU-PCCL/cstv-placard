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
    server.post("/content", async (req, res) => {
        const body = await req.body
        win.webContents.send('updateContent', body);
        res.status(200).json({status:"ok"})
    })
    server.post("/url", async (req, res) => {
        const body = await req.body
        win.webContents.send('updateUrl', body);
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
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            preload: path.join(__dirname, 'preload.js')
        }
    })
    win.setAlwaysOnTop(true, 'floating')

    await win.loadFile('index.html')
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
