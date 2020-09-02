import { app, BrowserWindow, ipcMain } from 'electron';
import { EventEmitter } from 'events';
import { environment } from '../environments/environment';
import { AppConfig } from './AppConfig';
import { AppCore } from './AppCore';
import { AppTray } from './AppTray';

export class Application extends EventEmitter {
  public tray: AppTray;
  public config: AppConfig;
  public mainWindow?: BrowserWindow;
  public core: AppCore;

  private static get mainWindowUrl(): string {
    return environment.production ? `file://${__dirname}/renderer/index.html` : 'http://localhost:4204';
  }

  constructor() {
    super();
    this.init();
  }

  private init() {
    this.core = new AppCore();
    this.tray = new AppTray();
    this.config = new AppConfig();
    ipcMain.handle('/api', async (_event, path: string, ...args: any[]) => {
      const [classStr, method] = path.replace(/^\//, '').split('/');
      if (this[classStr][method]) {
        console.log(classStr, method);
        return await this[classStr][method].apply(this[classStr], args);
      } else {
        throw new Error('method not found');
      }
    });
    this.initWindow();
  }

  initWindow() {
    this.mainWindow = this.genMainWindow();
    this.mainWindow.loadURL(Application.mainWindowUrl).then();
  }

  genMainWindow() {
    return new BrowserWindow({
      width: 900,
      height: 600,
      minWidth: 900,
      minHeight: 600,
      frame: false,
      titleBarStyle: 'hidden',
      transparent: true,
      webPreferences: {
        nodeIntegration: true,
        nodeIntegrationInWorker: true,
        enableRemoteModule: true,
        webSecurity: false,
      },
    });
  }

  showMainPanel() {
    if (this.mainWindow) {
      if (this.mainWindow.isDestroyed()) {
        this.initWindow();
      } else {
        this.mainWindow.show();
        this.mainWindow.focus();
      }
    }
  }

  quit() {
    app.quit();
  }

  setSystemProxy() {
    switch (process.platform) {
      case 'darwin':
        break;
    }
  }

  private serMacOSSystemProsy() {}
}
