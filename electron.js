const { app, BrowserWindow, Menu, dialog, shell} = require('electron');
const { autoUpdater } = require('electron-updater');
const { server } = require("./server");

var mainWindow = null;
app.on("window-all-closed", function(){
    app.quit();
});

app.on("ready", function () {
    mainWindow = new BrowserWindow({ width: 1400, height: 1000, frame: false });
    mainWindow.loadURL('http://localhost:23333');
    mainWindow.on("closed", function () {
        mainWindow =  null;
    });
    // Create the Application's main menu
    var template = [{
        label: "Kubecle",
        submenu: [
            { label: "Check for Update", click: checkForUpdates },
            { label: "About Application", selector: "orderFrontStandardAboutPanel:" },
            { label: "Open Dev Console", click: function() { mainWindow.webContents.openDevTools(); }},
            { type: "separator" },
            { label: "Quit", accelerator: "Command+Q", click: function() { app.quit(); }}
        ]}, {
        label: "Edit",
        submenu: [
            { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
            { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
            { type: "separator" },
            { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
            { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
            { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
            { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
        ]}
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
});

autoUpdater.autoDownload = false;
autoUpdater.logger = require("electron-log");
autoUpdater.logger.transports.file.level = "info";
var appReadyCheck = true;

app.on("ready", function () {
    autoUpdater.checkForUpdates();
});

autoUpdater.on('update-available', info => {
    dialog.showMessageBox({
        type: 'info',
        title: 'Found Updates',
        message: `New version ${info.releaseName} found, do you want to download it from github?`,
        buttons: ['Sure', 'No']
        }, (buttonIndex) => {
        if (buttonIndex === 0) {
            shell.openExternalSync('https://github.com/rydogs/kubecle/releases/latest');
            app.quit();
        } else {
            updater.enabled = true;
            updater = null;
        };
    });
});

autoUpdater.on('update-not-available', () => {
    if (!appReadyCheck) {
        dialog.showMessageBox({
            type: 'info',
            title: 'Update not available',
            message: `Update not available, v${app.getVersion()} is the latest version.`,
            buttons: ['Close']
        }, () => {
            if (updater) {
                updater.enabled = true;
            }
        });
    } else {
        appReadyCheck = false;
    }
});

function checkForUpdates (menuItem, focusedWindow, event) {
    updater = menuItem;
    updater.enabled = false;
    autoUpdater.checkForUpdates();
}