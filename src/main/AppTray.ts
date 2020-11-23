import { IConfigOutbound, ISubscribeConfig } from '@typing/config.interface';
import { Menu, MenuItemConstructorOptions, nativeImage, nativeTheme, shell, Tray } from 'electron';
import { macOS } from 'electron-is';
import log from 'electron-log';
import { EventEmitter } from 'events';
import fs from 'fs-extra';
import * as Path from 'path';

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
    const { config, core } = global.appInstance;
    const localNodeList = await config.getConfigByPath(config.nodeListPath, [] as IConfigOutbound[]);
    const subscribeList = await config.getConfigByPath(config.subscribesConfigPath, [] as ISubscribeConfig[]);
    const { enabled } = await config.getGuiConfig(['extensionMode', 'enabled']);
    const activated = await global.appInstance.config.getActivatedNode();
    return Menu.buildFromTemplate([
      {
        label: '开启v2ray',
        type: 'checkbox',
        checked: enabled,
        click: (ev) => {
          config.setGuiConfig({ enabled: ev.checked });
          if (ev.checked) {
            core.start();
          } else {
            core.stop();
          }
        },
      },
      {
        label: '节点选择',
        submenu: [
          ...localNodeList.map<MenuItemConstructorOptions>((node) => ({
            label: node.name,
            type: 'radio',
            checked: node.tag === (activated && activated.nodeTag),
            click: () => {
              config.setRunningConfig(node).then();
            },
          })),
          { type: 'separator' },
          ...subscribeList.map((sub) => ({
            label: sub.title,
            submenu: sub.nodes.map<MenuItemConstructorOptions>((node) => ({
              label: node.name,
              type: 'radio',
              checked: node.tag === (activated && activated.nodeTag),
              click: () => {
                config.setRunningConfig(node).then();
              },
            })),
          })),
        ],
      },
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
      {
        label: '查看日志',
        click: () => {
          shell.openPath(log.transports.file.getFile().path);
        },
      },
      {
        label: '退出',
        click: () => {
          global.appInstance.quit();
        },
      },
    ]);
  }

  async getTrayImage(upload: number, download: number) {
    if (macOS()) {
      if (nativeTheme.shouldUseDarkColors) {
        return nativeImage.createFromBuffer(fs.readFileSync(Path.resolve(__dirname, './assets/dog-dark.png')), {
          scaleFactor: 8.5,
        });
      } else {
        return nativeImage.createFromBuffer(fs.readFileSync(Path.resolve(__dirname, './assets/dog-light.png')), {
          scaleFactor: 8.5,
        });
      }
    }
    return nativeImage.createFromBuffer(fs.readFileSync(Path.resolve(__dirname, './assets/dog-colorful.png')), {
      scaleFactor: 8.5,
    });
  }

  formatSpeedText(speed: number) {
    if (speed < 1024) {
      return `${Math.round(speed)} KB/s`;
    } else {
      return `${Math.round((speed / 1024) * Math.pow(10, 2)) / Math.pow(10, 2)}MB/s`;
    }
  }
}
