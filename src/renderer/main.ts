import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

// tslint:disable-next-line: no-string-literal
window['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true;

try {
  platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch((err) => console.error(err));
} catch (err) {
  console.error(err.message);
}
