import { app, Event, nativeTheme } from 'electron';
import * as log from 'electron-log';
import { environment } from 'environments/environment';
import express from 'express';
import { check } from 'tcp-port-used';
import { Application } from './Application';

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

global.console.log = log.log;
global.console.warn = log.warn;
global.console.error = log.error;

async function makeSingleInstance() {
  const gotSingleLock = app.requestSingleInstanceLock();
  if (!gotSingleLock) {
    app.quit();
  } else {
    return app;
  }
}

function init() {
  makeSingleInstance().then(() => {
    if (environment.production) {
      const httpApp = express();
      httpApp.use('/', express.static(''));
    }

    app.dock.hide();
    app.on('ready', () => {
      global.appInstance = new Application();
      nativeTheme.on('updated', () => {
        if (global.appInstance.tray) {
          global.appInstance.tray.getTrayImage(0, 0).then((image) => {
            global.appInstance.tray.tray?.setImage(image);
          });
        }
      });
    });
    app.on('will-quit', (event) => {
      event.preventDefault();
      if (global.appInstance) {
        global.appInstance.quit();
      }
    });
    app.on('window-all-closed', (ev: Event) => {
      ev.preventDefault();
    });
  });
}

try {
  init();
} catch (err) {
  console.log(err);
}

function getSafeServerPort(port: number): any {
  return new Promise((resolve) => {
    this.checkPort(port, resolve);
  });
}

function checkPort(port: number, cb: (port: number) => any) {
  check(port, '127.0.0.1').then((inUse: boolean) => {
    if (inUse) {
      this.checkPort(port + 1, cb);
    } else {
      cb(port);
    }
  });
}
