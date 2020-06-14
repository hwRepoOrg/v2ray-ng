import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { IconDefinition } from '@ant-design/icons-angular';
import * as AllIcons from '@ant-design/icons-angular/icons';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { AppComponent } from './app.component';
import { routes } from './app.routing';
import { ElectronService } from './core/services/electron.service';
import { TitleComponent } from './layouts/title/title.component';
import { HomeComponent } from './pages/home/home.component';
import { NodeListComponent } from './pages/node-list/node-list.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

const antDesignIcons = AllIcons as {
  [key: string]: IconDefinition;
};
const icons: IconDefinition[] = Object.keys(antDesignIcons).map((key) => antDesignIcons[key]);

const LAYOUTS = [TitleComponent];

const PAGES = [HomeComponent, NodeListComponent];

@NgModule({
  declarations: [AppComponent, ...PAGES, ...LAYOUTS],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    RouterModule.forRoot(routes),
    NzIconModule.forRoot(icons),
    NgZorroAntdModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(private electronSrv: ElectronService) {
    this.electronSrv.remote.getGlobal('appInstance')?.showMainPanel();
  }
}
