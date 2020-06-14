import { app, BrowserWindow, Menu, Tray } from 'electron';
import { EventEmitter } from 'events';
import { environment } from '../environments/environment';
import { IApplication } from '../typings/application.interface';
import { getTrayImage } from './utils/tray';

export class Application extends EventEmitter implements IApplication {
  public tray?: Tray;
  public mainWindow?: BrowserWindow;

  private get mainWindowUrl(): string {
    return environment.production ? '../renderer/index.html' : 'http://localhost:4204';
  }

  constructor() {
    super();
    this.init();
  }

  private init() {
    this.initTray();
    this.showMainPanel();
  }

  private initTray() {
    getTrayImage(0, 0).then((image) => {
      this.tray = new Tray(image);
      this.tray.setContextMenu(
        Menu.buildFromTemplate([
          { label: '节点选择' },
          { label: '代理模式' },
          { type: 'separator' },
          {
            label: '退出',
            click: () => {
              this.quit();
            },
          },
        ])
      );
    });
  }

  showMainPanel() {
    if (!this.mainWindow) {
      this.mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 800,
        minHeight: 600,
        frame: false,
        titleBarStyle: 'hidden',
        transparent: true,
        webPreferences: { nodeIntegration: true, nodeIntegrationInWorker: true },
      });
    }
    this.mainWindow.loadURL(this.mainWindowUrl);
    this.mainWindow.show();
  }

  quit() {
    app.quit();
  }
}
