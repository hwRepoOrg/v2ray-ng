import { BrowserWindow, Tray } from 'electron';
import { EventEmitter } from 'events';
import { INode } from './node.interface';
import { ISubscribe } from './subscribe.interface';

export interface IApplication extends EventEmitter {
  tray?: Tray;
  mainWindow?: BrowserWindow;
  showMainPanel(): void;
  quit(): void;
  saveNodeConfig(nodes: INode[]): INode[];
  saveSubscribeConfig(subscribes: ISubscribe[]): ISubscribe[];
}
