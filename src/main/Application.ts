import { exec, execSync } from 'child_process';
import { BrowserWindow, ipcMain, Menu } from 'electron';
import { environment } from '../environments/environment';
import { AppConfig } from './AppConfig';
import { AppCore } from './AppCore';
import { AppTray } from './AppTray';

export class Application {
  public tray: AppTray;
  public config: AppConfig;
  public mainWindow?: BrowserWindow;
  public core: AppCore;
  private activeNet: string;

  private static get mainWindowUrl(): string {
    return environment.production ? `file://${__dirname}/renderer/index.html` : 'http://localhost:4204';
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
            {
              label: '退出',
              type: 'normal',
              role: 'quit',
            },
          ],
        },
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

  quit() {
    this.clearSystemProxy();
    this.core.stop();
  }

  clearSystemProxy() {
    switch (process.platform) {
      case 'darwin':
        if (this.activeNet) {
          execSync(`networksetup -setsocksfirewallproxystate "${this.activeNet}" off`);
          execSync(`networksetup -setsecurewebproxystate "${this.activeNet}" off`);
          execSync(`networksetup -setwebproxystate "${this.activeNet}" off`);
        }
        break;
    }
  }

  async setMacOSSystemProxy(status: boolean, type: 'socks' | 'http', port: number) {
    const stdout = await execShell(`networksetup -listnetworkserviceorder | grep 'Hardware Port'`);
    let netList = stdout
      .split('\n')
      .filter((s) => !!s)
      .map((s) => [s.match(/Hardware\sPort:\s(.+)?,/)[1], s.match(/Device:\s(.+)?\)$/)[1]]);
    let activeNet = null;
    while (netList.length) {
      const net = netList.pop();
      const isActive = (await execShell(`ifconfig ${net[1]} 2>/dev/null | grep 'status: active'`)).replace(/\s/g, '')
        .length;
      if (isActive) {
        activeNet = net;
        this.activeNet = activeNet[0];
        netList = [];
      }
    }
    let cmds = [];
    switch (type) {
      case 'socks':
        cmds = [`networksetup -setsocksfirewallproxy "${activeNet[0]}" ${status ? `"127.0.0.1" ${port}` : 'off'}`];
        break;
      case 'http':
        cmds = [
          `networksetup -setwebproxy "${activeNet[0]}" ${status ? `"127.0.0.1" ${port}` : 'off'}`,
          `networksetup -setsecurewebproxy "${activeNet[0]}" ${status ? `"127.0.0.1" ${port}` : 'off'}`,
        ];
        break;
    }
    while (cmds.length) {
      await execShell(cmds.pop());
    }
  }
}

function execShell(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.log(error.message);
        resolve('');
      } else {
        resolve(stdout ?? stderr);
      }
    });
  });
}
