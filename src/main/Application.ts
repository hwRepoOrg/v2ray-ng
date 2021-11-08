import { IConfigInbound } from '@typing/config.interface';
import { app, BrowserWindow, ipcMain, Menu, MenuItem } from 'electron';
import { environment } from '../environments/environment';
import { AppConfig } from './AppConfig';
import { AppCore } from './AppCore';
import { AppTray } from './AppTray';
import { setMacOSSystemProxy, setWinSystemProxy } from './utils';

export class Application {
  public tray: AppTray;
  public config: AppConfig;
  public mainWindow?: BrowserWindow;
  public core: AppCore;

  private static get mainWindowUrl(): string {
    return environment.production ? `http://127.0.0.1:${global.serverPort}/index.html` : 'http://localhost:4204';
  }

  constructor() {
    this.init();
  }

  private init() {
    this.config = new AppConfig();
    this.config.on('initialed', () => {
      this.tray = new AppTray();
      this.core = new AppCore();
    });
    ipcMain.handle('/api', async (_event, path: string, ...args: any[]) => {
      const [classStr, method] = path.replace(/^\//, '').split('/');
      if (this[classStr][method]) {
        return this[classStr][method].apply(this[classStr], args);
      } else if (this[classStr] && typeof this[classStr] === 'function') {
        return this[classStr].apply(this, args);
      } else {
        throw new Error('method not found');
      }
    });
  }

  initWindow() {
    this.mainWindow = this.genMainWindow();
    this.mainWindow.loadURL(Application.mainWindowUrl).then();
    Menu.setApplicationMenu(
      Menu.buildFromTemplate([
        {
          label: 'V2ray-NG',
          type: 'submenu',
          submenu: [
            {
              label: '关闭控制台',
              type: 'normal',
              accelerator: 'CmdOrCtrl+w',
              click: () => {
                global.appInstance.closeMainPanel();
              },
            },
            { label: 'edit', role: 'editMenu' },
            {
              label: '退出',
              type: 'normal',
              role: 'quit',
            },
          ],
        },
        ...(!environment.production ? [{ label: 'view', role: 'viewMenu' } as MenuItem] : []),
      ])
    );
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
        partition: 'main',
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
    } else {
      this.initWindow();
    }
  }

  closeMainPanel() {
    if (this.mainWindow) {
      this.mainWindow.close();
    }
  }

  async quit() {
    await this.core.stop();
    app.exit();
  }

  async clearSystemProxy() {
    const inbounds = (await this.config.getConfigByPath<IConfigInbound[]>(this.config.inboundsConfigPath)).filter(
      (item) => item.systemProxy
    );

    await Promise.all(
      inbounds.map<Promise<any>>((inbound) => {
        switch (process.platform) {
          case 'darwin':
            return setMacOSSystemProxy(false, inbound.protocol as 'socks' | 'http');
          case 'win32':
            return setWinSystemProxy(false, inbound.protocol as 'socks' | 'http');
        }
      })
    );
  }
}
