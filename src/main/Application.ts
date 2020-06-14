import { INode } from '@typing/node.interface';
import { ISubscribe } from '@typing/subscribe.interface';
import { app, BrowserWindow } from 'electron';
import { EventEmitter } from 'events';
import { readJsonSync, writeJsonSync } from 'fs-extra';
import * as path from 'path';
import { environment } from '../environments/environment';
import { IApplication } from '../typings/application.interface';
import { AppTray } from './AppTray';

export class Application extends EventEmitter implements IApplication {
  public tray?: AppTray;
  public mainWindow?: BrowserWindow;

  private homePath = process.env.HOME;
  private get mainWindowUrl(): string {
    return environment.production ? '../renderer/index.html' : 'http://localhost:4204';
  }

  constructor() {
    super();
    this.init();
  }

  private init() {
    this.tray = new AppTray();
    this.showMainPanel();
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

  saveNodeConfig(nodes: INode[]) {
    writeJsonSync(path.resolve(this.homePath, './.v2ray-ng/nodes.json'), nodes);
    return nodes;
  }

  saveSubscribeConfig(subscribes: ISubscribe[]) {
    writeJsonSync(path.resolve(this.homePath, './.v2ray-ng/nodes.json'), subscribes);
    return subscribes;
  }

  getNodes() {
    return readJsonSync(path.resolve(this.homePath, './.v2ray-ng/nodes.json'), { throws: false }) || [];
  }

  getSubscribes() {
    return readJsonSync(path.resolve(this.homePath, './.v2ray-ng/nodes.json'), { throws: false }) || [];
  }
}
