import { app, BrowserWindow } from 'electron';
import { EventEmitter } from 'events';
import { environment } from '../environments/environment';
import { AppConfig } from './AppConfig';
import { AppTray } from './AppTray';

export class Application extends EventEmitter {
  public tray: AppTray;
  public config: AppConfig;
  public mainWindow?: BrowserWindow;

  private get mainWindowUrl(): string {
    return environment.production ? '../renderer/index.html' : 'http://localhost:4204';
  }

  constructor() {
    super();
    this.init();
  }

  private init() {
    this.tray = new AppTray();
    this.config = new AppConfig();
    this.initWindow();
  }

  initWindow() {
    this.mainWindow = this.genMainWindow();
    this.mainWindow.loadURL(this.mainWindowUrl);
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
}
