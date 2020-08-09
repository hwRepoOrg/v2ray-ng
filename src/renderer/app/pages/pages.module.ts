import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonsModule } from '@renderer/commons/commons.module';
import { DelonABCModule } from '@renderer/delon-abc.module';
import { TitleComponent } from '@renderer/layouts/title/title.component';
import { NgZorroModule } from '@renderer/ng-zorro.module';
import { HomeComponent } from './home/home.component';
import { NodeCardComponent } from './node-list/components/node-card/node-card.component';
import { NodeConfigFormComponent } from './node-list/components/node-config-form/node-config-form.component';
import { NodeListComponent } from './node-list/node-list.component';
import { routes } from './pages.routing';
import { AppSettingsComponent } from './settings/components/app-settings/app-settings.component';
import { InputFormComponent } from './settings/components/input-form/input-form.component';
import { RoutingFormComponent } from './settings/components/routing-form/routing-form.component';
import { SettingsComponent } from './settings/settings.component';

@NgModule({
  imports: [RouterModule.forRoot(routes), CommonsModule, NgZorroModule, DelonABCModule],
  exports: [RouterModule],
  declarations: [
    HomeComponent,
    NodeListComponent,
    TitleComponent,
    NodeConfigFormComponent,
    NodeCardComponent,
    SettingsComponent,
    RoutingFormComponent,
    InputFormComponent,
    AppSettingsComponent,
  ],
})
export class PagesModule {}
