import { Injectable } from '@angular/core';
import * as childProcess from 'child_process';
import { ipcRenderer, remote, webFrame } from 'electron';
import * as is from 'electron-is';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ElectronService {
  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  remote: typeof remote;
  childProcess: typeof childProcess;
  is: typeof is;

  get isElectron(): boolean {
    return !!(window && window.process && window.process.type);
  }

  constructor() {
    if (this.isElectron) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.webFrame = window.require('electron').webFrame;
      this.remote = window.require('electron').remote;
      this.childProcess = window.require('child_process');
      this.is = this.remote.require('electron-is');
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
