import { Route } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { NodeListComponent } from './node-list/node-list.component';
import { SettingsComponent } from './settings/settings.component';
import { SubscribeListComponent } from './subscribe-list/subscribe-list.component';

export const routes: Route[] = [
  {
    path: '',
    component: HomeComponent,
    children: [
      { path: '', redirectTo: 'node-list', pathMatch: 'full' },
      { path: 'node-list', component: NodeListComponent },
      { path: 'subscribe-list', component: SubscribeListComponent },
      { path: 'settings', component: SettingsComponent },
    ],
  },
];
