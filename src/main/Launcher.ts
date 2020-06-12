import { EventEmitter } from 'events';
import { app } from 'electron';

export class Launcher extends EventEmitter {
  constructor() {
    super();
    this.init();
  }

  init() {
    console.log(app);
  }
}
