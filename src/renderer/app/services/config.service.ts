import { Injectable } from '@angular/core';
import { IConfigOutbound, ISubscribeConfig } from '@typing/config.interface';
import { ElectronService } from './electron.service';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  loading = false;
  subscribeList: ISubscribeConfig[] = [];
  localNodeList: IConfigOutbound[] = [];
  constructor(public es: ElectronService) {}

  getLocalNodeList() {
    this.loading = true;
    this.es.app.config
      .getNodeConfigList()
      .then((list) => {
        this.localNodeList = list;
      })
      .catch((err) => {
        this.es.log.error(err);
      })
      .finally(() => {
        this.loading = false;
      });
  }

  updateLocalNodeList(list: IConfigOutbound[]) {
    this.loading = true;
    this.es.app.config
      .setNodeConfigList(list)
      .then(() => {
        this.getLocalNodeList();
      })
      .catch((err) => {
        this.es.log.error(err);
      })
      .finally(() => {
        this.loading = false;
      });
  }

  setActivatedNode(node: IConfigOutbound | null) {
    if (node) {
      this.es.app.config.setRunningConfig(node).then((config) => {
        this.getLocalNodeList();
      });
    }
  }

  getSubscribeList() {
    this.loading = true;
    this.es.app.config
      .getSubscribesConfig()
      .then((list) => {
        this.subscribeList = list;
      })
      .catch((err) => {
        this.es.log.error(err);
      })
      .finally(() => {
        this.loading = false;
      });
  }

  updateSubscribeList(list: ISubscribeConfig[]) {
    this.loading = true;
    this.es.app.config
      .setSubscribesConfig(list)
      .then(() => {
        this.getSubscribeList();
      })
      .catch((err) => {
        this.es.log.error(err);
      })
      .finally(() => {
        this.loading = false;
      });
  }
}
