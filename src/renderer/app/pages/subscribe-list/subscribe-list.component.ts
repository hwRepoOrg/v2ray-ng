import { Component, OnInit, ViewChild } from '@angular/core';
import { ConfigService } from '@renderer/services/config.service';
import { ISubscribeConfig } from '@typing/config.interface';
import { NzDrawerComponent } from 'ng-zorro-antd/drawer';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'v2ray-subscribe-list',
  templateUrl: './subscribe-list.component.html',
  styleUrls: ['./subscribe-list.component.less'],
})
export class SubscribeListComponent implements OnInit {
  loading = false;
  activatedSubscribe: ISubscribeConfig;
  subscribeIndex: number;
  @ViewChild('drawer', { read: NzDrawerComponent })
  drawerRef: NzDrawerComponent;

  constructor(public cs: ConfigService) {}

  ngOnInit(): void {
    this.cs.getSubscribeList();
  }

  submit(config: ISubscribeConfig) {
    this.drawerRef.close();
    let list: ISubscribeConfig[];
    if (this.activatedSubscribe) {
      list = this.cs.subscribeList.map((subscribe, index) => (index === this.subscribeIndex ? config : subscribe));
    } else {
      list = [...this.cs.subscribeList, config];
    }
    this.cs.updateSubscribeList(list);
  }

  edit(index: number, subscribe: ISubscribeConfig) {
    this.subscribeIndex = index;
    this.activatedSubscribe = subscribe;
    this.drawerRef.open();
  }

  add() {
    this.subscribeIndex = null;
    this.activatedSubscribe = null;
    this.drawerRef.open();
  }

  delete(index: number) {
    this.cs.updateSubscribeList(this.cs.subscribeList.filter((_i, i) => i !== index));
  }

  syncSubscribe(url: string, index: number) {
    this.cs.loading = true;
    this.cs
      .getSubscribeNodesByUrl(url)
      .pipe(finalize(() => (this.cs.loading = false)))
      .subscribe((res) => {
        const nodes = this.cs.getNodesFromUrls(res);
        this.cs.updateSubscribeList(
          this.cs.subscribeList.map((sub, i) =>
            i === index
              ? { ...sub, nodes, updatedTime: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}` }
              : sub
          )
        );
      });
  }
}
