import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { IconDefinition } from '@ant-design/icons-angular';
import * as AllIcons from '@ant-design/icons-angular/icons';
import { DelonFormModule } from '@delon/form';
import {
  NzCardModule,
  NzDrawerModule,
  NzFormModule,
  NzLayoutModule,
  NzMenuModule,
  NzRadioModule,
  NzTagModule,
  NzToolTipModule
} from 'ng-zorro-antd';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzResizableModule } from 'ng-zorro-antd/resizable';
import { AppComponent } from './app.component';
import { routes } from './app.routing';
import { TitleComponent } from './layouts/title/title.component';
import { HomeComponent } from './pages/home/home.component';
import { NodeListComponent } from './pages/node-list/node-list.component';
import { ElectronService } from './services/electron.service';
import { NodeConfigFormComponent } from './pages/node-config-form/node-config-form.component';

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
  NzDrawerModule,
  NzResizableModule,
];
const THIRD_MODULES = [DelonFormModule.forRoot()];

const LAYOUTS = [TitleComponent];

const PAGES = [HomeComponent, NodeListComponent];

@NgModule({
  declarations: [AppComponent, ...PAGES, ...LAYOUTS, NodeConfigFormComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    ...ANTD_MODULES,
    ...THIRD_MODULES,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(private electronSrv: ElectronService) {
    this.electronSrv.remote.getGlobal('appInstance')?.showMainPanel();
  }
}
