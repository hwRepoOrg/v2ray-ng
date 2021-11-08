import { Component, Input } from '@angular/core';
import { ElectronService } from '../../services/electron.service';

@Component({
  selector: 'v2ray-title',
  templateUrl: './title.component.html',
  styleUrls: ['./title.component.less'],
})
export class TitleComponent {
  @Input() title: string;

  public get isMacOS() {
    return window.process.platform === 'darwin';
  }

  constructor(private electronSrv: ElectronService) {}

  minimal() {}

  close() {
    this.electronSrv.send('closeMainPanel');
  }
}
