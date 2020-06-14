import { Component } from '@angular/core';

@Component({
  selector: 'v2ray-root',
  template: ` <router-outlet></router-outlet> `,
  styleUrls: ['./app.component.less'],
})
export class AppComponent {
  title = 'v2ray-ng';
}
