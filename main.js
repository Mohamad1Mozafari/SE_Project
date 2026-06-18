// main.js
const { app, BrowserWindow } = require("electron");
const path = require("path");

// Keep a global reference to the window object
let mainWindow = null;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // Preload script for secure IPC (optional)
      // preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, "public", "vite.svg"), // optional icon
  });

  // Load the Vite dev server URL (development)
  mainWindow.loadURL("http://localhost:5173");

  // Open DevTools automatically for debugging (remove in production)
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  // On macOS, re-create a window when the dock icon is clicked and no windows are open
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});