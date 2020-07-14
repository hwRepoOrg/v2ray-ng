import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
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

  getConfigByProtocol(node: IConfigOutbound) {
    if (node.protocol === 'vmess') {
      return node.settings.vnext[0];
    }
    if (node.protocol === 'shadowsocks') {
      return node.settings.servers[0];
    }
  }

  getNodeByTag(tag: string): IConfigOutbound | null {
    let result = null;
    this.localNodeList.forEach((node) => {
      if (node.tag === tag) {
        result = node;
      }
    });
    return result;
  }

  setActivatedNode(node: IConfigOutbound | null) {
    if (node) {
    }
  }
}
