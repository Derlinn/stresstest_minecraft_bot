const { app, BrowserWindow, Menu, ipcMain, webContents } = require('electron/main')
const path = require('node:path')
const { startBots, setMoveBots, setRightClick  } = require('./bot_manager/runBots');
const { ipcRenderer } = require('electron/renderer');

let mainWindow;

const createWindow = () => {
  mainWindow  = new BrowserWindow({
    width: 500,
    height: 1400,
    resizable: false,
    webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false
    }
  })

  //mainWindow.webContents.openDevTools();
  mainWindow.loadFile('index.html')
}

const customMenu = Menu.buildFromTemplate([
    {
        label: "Reload",
        accelerator: "Ctrl+R",
    },
    {
        label: "Test",
        submenu: [
            {
                label: "Log Something",
                accelerator: "Ctrl+L",
                click: () => console.log("Log Something")
            }
        ]
    }
])

Menu.setApplicationMenu(customMenu);

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

let stopBotsFunction = null;

ipcMain.on('start-bots', (event, { numBots, cooldown, ip, port, botName }) => {
    global.logFunction(`Lancement de ${numBots} bots avec un cooldown de ${cooldown} ms sur le serveur ${ip}:${port}.`);

    stopBotsFunction = startBots({
        host: ip,
        port: port,
        numBots,
        cooldown,
        botName: botName
    });

    event.reply('bots-started');
});

ipcMain.on('stop-bots', () => {
    global.logFunction('Arrêt de tous les bots...');
    if (stopBotsFunction) {
        stopBotsFunction();
    } else {
        global.logFunction('Aucun bot en cours d\'exécution pour arrêter.');
    }
});

ipcMain.on('toggle-move-bots', (event, status) => {
  setMoveBots(status);
});

ipcMain.on('toggle-righ-click-bots', (event, status) => {
  setRightClick(status);
});

global.logFunction = (logMessage) => {
    if (mainWindow) {
        console.log(logMessage);
        mainWindow.webContents.send('update-log', logMessage);
    }
};