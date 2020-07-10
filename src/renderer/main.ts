import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { environment } from '../environments/environment';
import { AppModule } from './app/app.module';

// tslint:disable-next-line: no-string-literal
window['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true;

console.log = window.require('electron').remote.getGlobal('console').log;
console.warn = window.require('electron').remote.getGlobal('console').warn;
console.error = window.require('electron').remote.getGlobal('console').error;

if (environment.production) {
  enableProdMode();
}

try {
  platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch((err) => console.error(err));
} catch (err) {
  console.error(err.message);
}
