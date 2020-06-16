import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { IconDefinition } from '@ant-design/icons-angular';
import * as AllIcons from '@ant-design/icons-angular/icons';
import {
  NzCardModule,
  NzFormModule,
  NzLayoutModule,
  NzMenuModule,
  NzRadioModule,
  NzToolTipModule,
  NzTagModule,
} from 'ng-zorro-antd';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { AppComponent } from './app.component';
import { routes } from './app.routing';
import { ElectronService } from './services/electron.service';
import { TitleComponent } from './layouts/title/title.component';
import { HomeComponent } from './pages/home/home.component';
import { NodeInfoComponent } from './pages/node-list/node-info/node-info.component';
import { NodeListComponent } from './pages/node-list/node-list.component';

const antDesignIcons = AllIcons as {
  [key: string]: IconDefinition;
};
const icons: IconDefinition[] = Object.keys(antDesignIcons).map((key) => antDesignIcons[key]);

const ANTD_MODULES = [
  NzIconModule.forRoot(icons),
  NzToolTipModule,
  NzMenuModule,
  NzLayoutModule,
  NzCardModule,
  NzFormModule,
  NzRadioModule,
  NzTagModule,
];

const LAYOUTS = [TitleComponent];

const PAGES = [HomeComponent, NodeListComponent, NodeInfoComponent];

@NgModule({
  declarations: [AppComponent, ...PAGES, ...LAYOUTS],
  imports: [BrowserModule, BrowserAnimationsModule, CommonModule, RouterModule.forRoot(routes), ...ANTD_MODULES],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(private electronSrv: ElectronService) {
    this.electronSrv.remote.getGlobal('appInstance')?.showMainPanel();
  }
}
