import { Route } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { NodeListComponent } from './pages/node-list/node-list.component';

export const routes: Route[] = [
  {
    path: '',
    component: HomeComponent,
    children: [
      { path: '', redirectTo: 'node-list', pathMatch: 'full' },
      { path: 'node-list', component: NodeListComponent },
    ],
  },
];
