import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { DelonFormModule } from '@delon/form';
import { AppComponent } from './app.component';
import { routes } from './app.routing';
import { CommonsModule } from './commons/commons.module';
import { TitleComponent } from './layouts/title/title.component';
import { NgZorroModule } from './ng-zorro.module';
import { HomeComponent } from './pages/home/home.component';
import { NodeConfigFormComponent } from './pages/node-config-form/node-config-form.component';
import { NodeListComponent } from './pages/node-list/node-list.component';
import { ElectronService } from './services/electron.service';

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
    NgZorroModule,
    CommonsModule,
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
