import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { UtilsService } from '@renderer/commons/services/utils.service';
import { ElectronService } from '@renderer/services/electron.service';
import { IConfigOutbound } from '@typing/config.interface';

@Component({
  selector: 'v2ray-node-list',
  templateUrl: './node-list.component.html',
  styleUrls: ['./node-list.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodeListComponent implements OnInit {
  public drawerWidth = 785;
  public drawerVisible = false;
  public localNodeList: IConfigOutbound[] = [];
  public nodeConfig: IConfigOutbound = null;

  constructor(private electronSrv: ElectronService) {}

  ngOnInit() {
    this.getLocalNodeList();
  }

  toggleDrawer(config?: IConfigOutbound) {
    this.nodeConfig = config;
    this.drawerVisible = !this.drawerVisible;
  }

  getLocalNodeList() {
    this.localNodeList = this.electronSrv.remote.getGlobal('appInstance').config.getNodeConfigList();
  }

  addNode(nodeConfig: IConfigOutbound) {
    this.electronSrv.remote.getGlobal('appInstance').config.addNodeConfig(nodeConfig);
  }

  setActivatedNode(node: IConfigOutbound | null) {
    if (node) {
    }
  }
}
