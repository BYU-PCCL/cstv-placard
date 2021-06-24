const {app, BrowserWindow} = require('electron')
const path = require('path')
const fs = require('fs')
const express = require('express')

const {env} = process;
const runtimePath = path.join(env.XDG_RUNTIME_DIR, "placard")
const socketPath = path.join(runtimePath, "socket")

let win;

const content = {
    title: "Starting...",
    description: null,
    artist: null,
    url: null,
};

async function createServer() {
    const server = express();
    server.use(express.json())
    server.patch("/placard", async (req, res) => {
        const body = await req.body;

        Object.keys(content).reduce((_, val) => {
            const bodyVal = body[val];
            if (bodyVal === undefined) {
                return;
            }

            content[val] = bodyVal
        })

        win.webContents.send("updateContent", content);
        res.status(200).json({status: "ok"});
    });
    server.get("/placard", async (_, res) => {
        res.status(200).json(content);
    });

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

    win.webContents.send("updateContent", content)
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
