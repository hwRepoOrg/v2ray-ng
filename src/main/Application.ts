import { EventEmitter } from 'events';
import { Tray } from 'electron';
import { getTrayImage } from './utils/tray';

export class Application extends EventEmitter {
  public tray?: Tray;
  constructor() {
    super();
    this.init();
  }

  init() {
    this.initTray();
  }

  initTray() {
    getTrayImage(0, 0).then((image) => {
      this.tray = new Tray(image);
    });
  }
}
