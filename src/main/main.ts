import { app } from 'electron';
import * as log from 'electron-log';
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
    app.on('ready', () => {
      global.appInstance = new Application();
    });
    app.on('window-all-closed', () => {
      app.dock.hide();
    });
    app.on('quit', () => {
      if (global.appInstance) {
        global.appInstance.quit();
      }
    });
  });
}

try {
  init();
} catch (err) {
  console.log(err);
}
