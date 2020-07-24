import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'v2ray-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  constructor() {}
}
