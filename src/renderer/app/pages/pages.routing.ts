import { Route } from '@angular/router';
import { InputFormComponent } from '@renderer/pages/input-form/input-form.component';
import { RoutingFormComponent } from '@renderer/pages/routing-form/routing-form.component';
import { SettingsComponent } from '@renderer/pages/settings/settings.component';
import { HomeComponent } from './home/home.component';
import { NodeListComponent } from './node-list/node-list.component';
import { SubscribeListComponent } from './subscribe-list/subscribe-list.component';

export const routes: Route[] = [
  {
    path: '',
    component: HomeComponent,
    children: [
      { path: '', redirectTo: 'node-list', pathMatch: 'full' },
      { path: 'node-list', component: NodeListComponent },
      { path: 'subscribe-list', component: SubscribeListComponent },
      { path: 'inbounds-settings', component: InputFormComponent },
      { path: 'routing-settings', component: RoutingFormComponent },
      { path: 'settings', component: SettingsComponent },
    ],
  },
];
