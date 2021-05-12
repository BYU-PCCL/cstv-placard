const {app, BrowserWindow} = require('electron')
const path = require('path')
const fs = require('fs')
const express = require('express') //your express app

const {env} = process;
const runtimePath = path.join(env.XDG_RUNTIME_DIR, "placard")
const socketPath = path.join(runtimePath, "socket")

let win;
// const ipc = require('electron').ipcMain

async function createServer() {
    const server = express();
    server.post("/show", (_req, res) => {
        win.webContents.send('setVisibility', true);
        win.webContents.send('setVisibility', "Test");
        res.status(200).json({status:"ok"})
    })
    server.post("/hide", (_req, res) => {
        win.webContents.send('setVisibility', false);
        res.status(200).json({status:"ok"})
    })
    // server.post("/content", (req, res) => {
    //     win.webContents.send('setVisibility', false);
    //     res.status(200).json({status:"ok"})
    // })

    // TODO: See if it would be better to do some sort of IPC here instead
    // server.listen(app.commandLine.getSwitchValue("port") || 8089, "localhost")

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

    // app.on('activate', () => {
    //     if (BrowserWindow.getAllWindows().length === 0) {
    //         createWindow()
    //     }
    // })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})