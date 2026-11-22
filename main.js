const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    title: "Tez-Up POS - Professional Restaurant System",
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      enableRemoteModule: false
    }
  });

  // index.html yuklash
  mainWindow.loadFile('index.html');

  // To'liq ekran yoki kiosk rejimi sozlamalari (ixtiyoriy)
  mainWindow.maximize();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Ilova ishga tushganda
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Chekni to'g'ridan-to'g'ri termal printerga yuborish (Silent Printing)
ipcMain.handle('print-receipt', async (event, options = {}) => {
  if (!mainWindow) return { success: false, error: 'No active window' };

  try {
    mainWindow.webContents.print({
      silent: false, // Foydalanuvchi printerni tanlashi uchun (yoki true bo'lsa default printerdan avtomat chiqaradi)
      printBackground: true,
      deviceName: options.printerName || '',
      pageSize: { width: 80000, height: 297000 } // 80mm termal kassa qog'ozi
    }, (success, failureReason) => {
      console.log('Print result:', success, failureReason);
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});
