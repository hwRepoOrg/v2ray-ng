import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DelonFormModule } from '@delon/form';
import { AlainThemeModule } from '@delon/theme';
import { AppComponent } from './app.component';
import { GlobalConfigModule } from './global-config.module';
import { PagesModule } from './pages/pages.module';
import { ElectronService } from './services/electron.service';

const THIRD_MODULES = [DelonFormModule.forRoot(), AlainThemeModule.forRoot()];

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, BrowserAnimationsModule, GlobalConfigModule.forRoot(), ...THIRD_MODULES, PagesModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(private electronSrv: ElectronService) {
    this.electronSrv.remote.getGlobal('appInstance')?.showMainPanel();
  }
}
