import { Component, OnInit, TemplateRef } from '@angular/core';
import { ConfigService } from '@renderer/services/config.service';
import { IConfigOutbound } from '@typing/config.interface';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'v2ray-node-list',
  templateUrl: './node-list.component.html',
  styleUrls: ['./node-list.component.less'],
})
export class NodeListComponent implements OnInit {
  public drawerWidth = 785;
  public drawerVisible = false;
  public nodeConfig: IConfigOutbound = null;
  public urls: string;
  get loading() {
    return this.cs.loading;
  }
  get localNodeList() {
    return this.cs.localNodeList;
  }
  get subscribeList() {
    return this.cs.subscribeList;
  }

  constructor(public cs: ConfigService, private modalSrv: NzModalService) {}

  ngOnInit() {
    this.cs.getLocalNodeList();
    this.cs.getSubscribeList();
  }

  toggleDrawer(config?: IConfigOutbound) {
    this.nodeConfig = config;
    this.drawerVisible = !this.drawerVisible;
  }

  nodeFormSubmit(nodeConfig: IConfigOutbound) {
    this.toggleDrawer(null);
    let nodeList: IConfigOutbound[];
    let newNode: IConfigOutbound;
    if (nodeConfig.tag) {
      nodeList = this.localNodeList.map((node) => (node.tag === nodeConfig.tag ? nodeConfig : node));
    } else {
      newNode = { ...nodeConfig, tag: `${Date.now()}${Math.round(Math.random() * 100000000)}` };
      nodeList = [...this.localNodeList, newNode];
    }
    this.cs.updateLocalNodeList(nodeList);
  }

  showUrlsForm(tpl: TemplateRef<any>) {
    this.urls = '';
    const modalRef = this.modalSrv.create({
      nzTitle: '添加节点',
      nzWidth: 700,
      nzContent: tpl,
      nzFooter: [
        {
          type: 'default',
          label: '取消',
          onClick: () => {
            modalRef.destroy();
          },
        },
        {
          type: 'primary',
          label: '保存',
          disabled: () => !this.urls,
          onClick: () => {
            this.cs.updateLocalNodeList([...this.localNodeList, ...this.cs.getNodesFromUrls(this.urls)]);
            modalRef.destroy();
          },
        },
      ],
    });
  }
}
