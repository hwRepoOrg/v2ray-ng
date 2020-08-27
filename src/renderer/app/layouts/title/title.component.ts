import { Component, Input } from '@angular/core';
import { Application } from '@main/Application';
import { ElectronService } from '../../services/electron.service';

@Component({
  selector: 'v2ray-title',
  templateUrl: './title.component.html',
  styleUrls: ['./title.component.less'],
})
export class TitleComponent {
  @Input() title: string;
  private get application(): Application {
    return this.electronSrv.remote.getGlobal('appInstance');
  }
  public get isMacOS() {
    return this.electronSrv.is.macOS();
  }

  constructor(private electronSrv: ElectronService) {}

  minimal() {}

  close() {
    this.application.mainWindow?.close();
  }
}
