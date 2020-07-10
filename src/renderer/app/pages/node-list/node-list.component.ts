import { Component } from '@angular/core';
import { ElectronService } from '@renderer/services/electron.service';
import { IConfigOutbound } from '@typing/config.interface';

@Component({
  selector: 'v2ray-node-list',
  templateUrl: './node-list.component.html',
  styleUrls: ['./node-list.component.less'],
})
export class NodeListComponent {
  public drawerWidth = 785;
  public drawerVisible = false;

  constructor(private electronSrv: ElectronService) {}

  toggleDrawer() {
    this.drawerVisible = !this.drawerVisible;
  }

  addNode(nodeConfig: IConfigOutbound) {
    this.electronSrv.remote.getGlobal('appInstance').config.addNodeConfig(nodeConfig);
  }
}
