import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { environment } from '../../environments/environment';
import { AppComponent } from './app.component';
import { GlobalConfigModule } from './global-config.module';
import { PagesModule } from './pages/pages.module';
import { ElectronService } from './services/electron.service';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, BrowserAnimationsModule, HttpClientModule, GlobalConfigModule.forRoot(), PagesModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(private electronSrv: ElectronService) {
    if (environment.production) {
      this.electronSrv.send('showMainPanel');
    }
  }
}
