import { IConfigOutbound, ISubscribeConfig } from '@typing/config.interface';
import { createCanvas, loadImage } from 'canvas';
import { Menu, nativeImage, nativeTheme, shell, Tray } from 'electron';
import { macOS } from 'electron-is';
import { EventEmitter } from 'events';
import fs from 'fs-extra';
import dogColorful from './assets/dog-colorful.png';
import dogDark from './assets/dog-dark.png';
import dogLight from './assets/dog-light.png';

export class AppTray extends EventEmitter {
  public tray?: Tray;
  constructor() {
    super();
    this.init();
  }

  init() {
    this.getTrayImage(0, 0).then((image) => {
      this.tray = new Tray(image);
      this.updateTrayContextMenu();
    });
  }

  updateTrayContextMenu() {
    this.getTrayContextMenus().then((menu) => {
      this.tray.setContextMenu(menu);
    });
  }

  async getTrayContextMenus(): Promise<Menu> {
    const config = global.appInstance.config;
    const localNodeList = await config.getConfigByPath(config.nodeListPath, [] as IConfigOutbound[]);
    const subscribeList = await config.getConfigByPath(config.subscribesConfigPath, [] as ISubscribeConfig[]);
    const { proxyMode, extensionMode } = await config.getGuiConfig(['proxyMode', 'extensionMode']);
    return Menu.buildFromTemplate([
      {
        label: '节点选择',
        submenu: [
          ...localNodeList.map((node) => ({ label: node.name, checked: node.active })),
          { type: 'separator' },
          ...subscribeList.map((sub) => ({
            label: sub.title,
            submenu: sub.nodes.map((node) => ({ label: node.name, checked: node.active })),
          })),
        ],
      },
      {
        label: '代理模式',
        submenu: [
          { label: '系统代理', type: 'radio', checked: proxyMode === 'system' },
          { label: '手动', type: 'radio', checked: proxyMode === 'manual' },
        ],
      },
      { label: '增强模式', checked: extensionMode, type: 'checkbox' },
      { type: 'separator' },
      {
        label: '控制面板',
        click: () => {
          global.appInstance.showMainPanel();
        },
      },
      {
        label: '打开配置文件夹',
        click: () => {
          shell.openPath(global.appInstance.config.configPath);
        },
      },
      { label: '退出', role: 'quit' },
    ]);
  }

  async getTrayImage(upload: number, download: number) {
    if (macOS()) {
      if (nativeTheme.shouldUseDarkColors) {
        return nativeImage.createFromBuffer(fs.readFileSync(dogDark), { scaleFactor: 8.5 });
      } else {
        return nativeImage.createFromBuffer(fs.readFileSync(dogLight), { scaleFactor: 8.5 });
      }
    }
    return nativeImage.createFromBuffer(fs.readFileSync(dogColorful), { scaleFactor: 8.5 });
  }

  formatSpeedText(speed: number) {
    if (speed < 1024) {
      return `${Math.round(speed)} KB/s`;
    } else {
      return `${Math.round((speed / 1024) * Math.pow(10, 2)) / Math.pow(10, 2)}MB/s`;
    }
  }

  async getMacOSTrayImage(imgUrl: string, upload: number, download: number, isDark: boolean) {
    const canvas = createCanvas(300, 96);
    const ctx = canvas.getContext('2d');
    const image = await loadImage(imgUrl);
    ctx.drawImage(image, 0, 0, 200, 200, 5, 0, 96, 96);
    ctx.beginPath();
    ctx.fillStyle = isDark ? '#ffffff' : '#333';
    ctx.font = '590 35px ".SF Display"';
    ctx.direction = 'rtl';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(this.formatSpeedText(upload), 290, 15);
    ctx.fillText(this.formatSpeedText(download), 290, 55);
    ctx.closePath();
    return nativeImage.createFromBuffer(canvas.toBuffer(), { scaleFactor: 4 });
  }

  updateTrayImage(upload: number, download: number) {
    if (macOS()) {
      this.getTrayImage(upload, download).then((image) => {
        this.tray.setImage(image);
      });
    }
  }
}
