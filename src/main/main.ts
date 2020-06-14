import { app } from 'electron';
import { Application } from './Application';

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
  });
}

init();
