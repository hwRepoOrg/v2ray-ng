import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IConfigOutbound, ISubscribeConfig, IVmessShareConfig, VMESS_SHARE_NET } from '@typing/config.interface';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';
import { ElectronService } from './electron.service';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  loading = false;
  subscribeList: ISubscribeConfig[] = [];
  localNodeList: IConfigOutbound[] = [];
  constructor(public es: ElectronService, private http: HttpClient) {}

  transformVmessShareConfig(vmessConfig: IVmessShareConfig): IConfigOutbound {
    return {
      name: vmessConfig.ps ?? '',
      protocol: 'vmess',
      tag: `${Date.now()}${Math.round(Math.random() * 100000000)}`,
      settings: {
        vnext: [
          {
            address: vmessConfig.add,
            port: +vmessConfig.port,
            users: [{ id: vmessConfig.id, alertId: vmessConfig.aid }],
          },
        ],
      },
      streamSettings: {
        network: VMESS_SHARE_NET[vmessConfig.net],
        security: (vmessConfig.tls as any) ?? 'none',
        httpSettings: {
          path: vmessConfig.path ?? null,
          host: (vmessConfig.host as any) ?? null,
        },
        kcpSettings: {
          header: {
            type: (vmessConfig.type as any) ?? null,
          },
        },
        tcpSettings: {
          header: {
            type: vmessConfig.type as any,
          },
        },
        wsSettings: {
          path: vmessConfig.path,
          headers: {
            Host: vmessConfig.host,
          },
        },
        quicSettings: {
          header: {
            type: vmessConfig.type as any,
          },
        },
      },
    };
  }

  transformSSShareConfig(str: string): IConfigOutbound {
    const [base64Str, name] = str.split('#');
    const configStr = atob(base64Str);
    const [str1, str2] = configStr.split('@');
    const [method, password] = str1.split(':');
    const [address, port] = str2.split(':');
    return {
      name,
      protocol: 'shadowsocks',
      tag: `${Date.now()}${Math.round(Math.random() * 100000000)}`,
      settings: {
        servers: [{ address, port: +port, method, password }],
      },
    };
  }

  getActivatedNode() {
    return from(this.es.app.config.getActivatedNode());
  }

  getNodesFromUrls(configStr: string) {
    try {
      return configStr
        .split('\n')
        .filter((s) => !!s)
        .map<{ protocol: string; config: any }>((config) => {
          const [protocol, str] = config.split('://');
          return { protocol, config: protocol === 'vmess' ? atob(str) : str };
        })
        .filter(({ protocol }) => /(vmess|ss)/.test(protocol))
        .map<IConfigOutbound>(({ protocol, config }) => {
          switch (protocol) {
            case 'ss':
              return this.transformSSShareConfig(config);
            case 'vmess':
              return this.transformVmessShareConfig(JSON.parse(config));
          }
        });
    } catch (err) {
      return [];
    }
  }

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
      this.updateLocalNodeList(
        this.localNodeList.map((config) =>
          node.tag === config.tag ? { ...config, active: true } : { ...config, active: false }
        )
      );
      this.updateSubscribeList(
        this.subscribeList.map((sub) => ({
          ...sub,
          nodes: sub.nodes.map((config) =>
            node.tag === config.tag ? { ...config, active: true } : { ...config, active: false }
          ),
        }))
      );
      this.es.app.config.setRunningConfig(node).then(() => {
        this.getLocalNodeList();
        this.getSubscribeList();
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

  getSubscribeNodesByUrl(url: string) {
    return this.http
      .get(url, { responseType: 'text', params: { time: Date.now().toString() } })
      .pipe(map((res) => atob(res)));
  }
}
