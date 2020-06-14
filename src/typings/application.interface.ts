import { AppTray } from '@main/AppTray';
import { BrowserWindow } from 'electron';
import { EventEmitter } from 'events';
import { INode } from './node.interface';
import { ISubscribe } from './subscribe.interface';

export interface IApplication extends EventEmitter {
  tray?: AppTray;
  mainWindow?: BrowserWindow;
  showMainPanel(): void;
  quit(): void;
  saveNodeConfig(nodes: INode[]): INode[];
  saveSubscribeConfig(subscribes: ISubscribe[]): ISubscribe[];
  getNodes(): INode[];
  getSubscribes(): ISubscribe[];
}
