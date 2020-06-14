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
    this.mainWindow = new BrowserWindow({
      width: 900,
      height: 600,
      minWidth: 900,
      minHeight: 600,
      frame: false,
      titleBarStyle: 'hidden',
      transparent: true,
      webPreferences: { nodeIntegration: true, nodeIntegrationInWorker: true, enableRemoteModule: true },
    });
    this.mainWindow.loadURL(this.mainWindowUrl);
  }

  showMainPanel() {
    if (!this.mainWindow.isVisible()) {
      this.mainWindow.show();
    }
  }

  quit() {
    app.quit();
  }
}
