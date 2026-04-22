const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 900,
        minHeight: 700,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            webSecurity: true
        },
        icon: path.join(__dirname, 'icon.ico'),
        show: false,
        backgroundColor: '#667eea'
    });

    // Carrega o arquivo HTML
    const htmlPath = path.join(__dirname, 'AutomacaoSPED.html');
    
    // Verifica se o arquivo existe
    if (fs.existsSync(htmlPath)) {
        mainWindow.loadFile(htmlPath);
    } else {
        // Fallback: carrega HTML inline
        mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(getHTMLContent())}`);
    }

    // Mostra a janela quando estiver pronta
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        
        // Foca na janela
        if (process.platform === 'win32') {
            mainWindow.setAlwaysOnTop(true);
            mainWindow.setAlwaysOnTop(false);
        }
    });

    // Abre DevTools em desenvolvimento (comentar em produção)
    // mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Função para obter conteúdo HTML inline (fallback)
function getHTMLContent() {
    try {
        return fs.readFileSync(path.join(__dirname, 'AutomacaoSPED.html'), 'utf8');
    } catch (e) {
        return '<html><body><h1>Erro: Arquivo HTML não encontrado</h1></body></html>';
    }
}

// Quando Electron estiver pronto
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Fecha quando todas as janelas forem fechadas
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Previne navegação para URLs externas
app.on('web-contents-created', (event, contents) => {
    contents.on('new-window', (event, navigationUrl) => {
        event.preventDefault();
    });
    
    contents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl);
        
        if (parsedUrl.origin !== 'file://') {
            event.preventDefault();
        }
    });
});

