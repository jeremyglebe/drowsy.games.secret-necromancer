const path = require('path');
const { app, BrowserWindow } = require('electron');

// Run the Client
console.log("Running client...");

// Use live reload with electron if we're running for development
if (process.argv.includes("dev")) {
    console.log("Running with live reload...");
    console.log("Watching for changes at:", __dirname);
    try {
        require('electron-reload')(__dirname);
    } catch (e) {
        console.log("Error launching with live reload:", e);
        console.log("Electron app will run without live reload.")
    }
}

/**
 * Creates and configures the Electron window
 */
function createWindow() {
    // Browser window configuration
    let win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });
    if (process.argv.includes("dev")) {
        // Open the DevTools if running in dev mode
        win.webContents.openDevTools();
    } else {
        // Remove the menu bar if we aren't running dev
        win.removeMenu();
    }

    // Load the index.html of the app
    win.loadFile(path.join(__dirname, 'index.html'));
}
// Create the electron window once the app is ready
app.whenReady().then(createWindow);