const {app, BrowserWindow} = require('electron')
const path = require('path')
const fs = require('fs')
const express = require('express') //your express app

const {env} = process;
const runtimePath = path.join(env.XDG_RUNTIME_DIR, "placard")
const socketPath = path.join(runtimePath, "socket")

async function createServer() {
    const server = express();
    server.post("/show")
    server.post("/hide")
    // TODO: See if it would be better to do some sort of IPC here instead
    // server.listen(app.commandLine.getSwitchValue("port") || 8089, "localhost")

    fs.mkdirSync(runtimePath)
    server.listen(socketPath)
}

async function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        transparent: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })
    win.setAlwaysOnTop(true, 'floating')
    // win.setIgnoreMouseEvents(true, {forward: true})

    win.loadFile('index.html').then(() => {
        if (app.commandLine.getSwitchValue("uuid")) {
            win.setTitle(app.commandLine.getSwitchValue("uuid"))
        }
    })
}

app.whenReady().then(() => {
    setTimeout(function () {
        createWindow();
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