import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ElectronService } from '@renderer/services/electron.service';
import { IConfigOutbound } from '@typing/config.interface';
import { NzMessageService } from 'ng-zorro-antd/message';

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
  public loading = false;

  constructor(private electronSrv: ElectronService, private msg: NzMessageService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.getLocalNodeList();
  }

  toggleDrawer(config?: IConfigOutbound) {
    this.nodeConfig = config;
    this.drawerVisible = !this.drawerVisible;
  }

  getLocalNodeList() {
    this.loading = true;
    this.electronSrv.app.config
      .getNodeConfigList()
      .then((list) => {
        this.electronSrv.app.config.getActivatedNode().then((activated) => {
          this.localNodeList = list.map((node) => {
            if (activated) {
              node.active = node.tag === activated?.nodeTag;
            }
            return node;
          });
          this.loading = false;
          this.cdr.detectChanges();
        });
      })
      .catch((err) => {
        this.electronSrv.remote.getGlobal('console').error(err);
        this.loading = false;
        this.cdr.detectChanges();
      });
  }

  nodeFormSubmit(nodeConfig: IConfigOutbound) {
    this.electronSrv.app.config[nodeConfig.tag ? 'updateNodeConfig' : 'addNodeConfig'](nodeConfig)
      .then(() => {
        this.msg.success(`节点${nodeConfig.tag ? '更新' : '添加'}成功`);
      })
      .catch((err: Error) => {
        this.msg.error(`操作失败。err: ${err.message}`);
      })
      .finally(() => {
        this.drawerVisible = false;
        this.getLocalNodeList();
        this.cdr.detectChanges();
      });
  }

  setActivatedNode(node: IConfigOutbound | null) {
    if (node) {
      this.electronSrv.app.config.setRunningConfig(node).then((config) => {
        this.getLocalNodeList();
      });
    }
  }
}
