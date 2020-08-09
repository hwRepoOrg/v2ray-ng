import { Component, OnInit } from '@angular/core';
import { ConfigService } from '@renderer/services/config.service';
import { IConfigOutbound } from '@typing/config.interface';

@Component({
  selector: 'v2ray-node-list',
  templateUrl: './node-list.component.html',
  styleUrls: ['./node-list.component.less'],
})
export class NodeListComponent implements OnInit {
  public drawerWidth = 785;
  public drawerVisible = false;
  public nodeConfig: IConfigOutbound = null;

  constructor(public cs: ConfigService) {}

  ngOnInit() {
    this.cs.getLocalNodeList();
  }

  toggleDrawer(config?: IConfigOutbound) {
    this.nodeConfig = config;
    this.drawerVisible = !this.drawerVisible;
  }

  nodeFormSubmit(nodeConfig: IConfigOutbound) {
    let nodeList: IConfigOutbound[];
    let newNode: IConfigOutbound;
    if (nodeConfig.tag) {
      nodeList = this.cs.localNodeList.map((node) => (node.tag === nodeConfig.tag ? nodeConfig : node));
    } else {
      newNode = { ...nodeConfig, tag: `${Date.now()}${Math.round(Math.random() * 100000000)}` };
      nodeList = [...this.cs.localNodeList, newNode];
    }
    this.cs.updateLocalNodeList(nodeList);
  }
}
