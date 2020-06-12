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
    global.appInstance = new Application();
  });
}

init();
