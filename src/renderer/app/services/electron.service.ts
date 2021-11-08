import { Injectable } from '@angular/core';
import * as childProcess from 'child_process';
import { ipcRenderer, webFrame } from 'electron';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ElectronService {
  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  childProcess: typeof childProcess;

  get isElectron(): boolean {
    return !!(window && window.process && window.process.type);
  }

  constructor() {
    if (this.isElectron) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.webFrame = window.require('electron').webFrame;
      this.childProcess = window.require('child_process');
    }
  }

  send<T = any>(channel: string, ...args: any[]): Observable<T> {
    return from(this.ipcRenderer.invoke('/api', channel, ...args));
  }

  getRemoteProperty(name: string, str?: string) {
    let res;
    try {
      // tslint:disable-next-line: no-eval
      res = eval(`this.remote.getGlobal('${name}')${str}`);
    } catch (e) {
      console.log(e);
    }
    return res;
  }
}
