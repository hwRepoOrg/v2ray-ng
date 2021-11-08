import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IConfigOutbound, ISubscribeConfig, IVmessShareConfig, VMESS_SHARE_NET } from '@typing/config.interface';
import { finalize, map } from 'rxjs/operators';
import { ElectronService } from './electron.service';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  loading = false;
  subscribeList: ISubscribeConfig[] = [];
  localNodeList: IConfigOutbound[] = [];
  activatedNode: IConfigOutbound | null;
  constructor(public es: ElectronService, private http: HttpClient) {
    this.getActivatedNode();
  }

  transformVmessShareConfig(vmessConfig: IVmessShareConfig): IConfigOutbound {
    for (const k in vmessConfig) {
      if (vmessConfig.hasOwnProperty(k)) {
        if (vmessConfig[k] === '') {
          vmessConfig[k] = null;
        }
      }
    }
    return {
      name: vmessConfig.ps ?? '',
      protocol: 'vmess',
      tag: `${Date.now()}${Math.round(Math.random() * 100000000)}`,
      settings: {
        vnext: [
          {
            address: vmessConfig.add,
            port: +vmessConfig.port,
            users: [
              {
                id: vmessConfig.id,
                security: 'auto',
                alterId: +vmessConfig.aid,
                level: 0,
                encryption: null,
                flow: null,
              },
            ],
          },
        ],
      },
      streamSettings: {
        network: VMESS_SHARE_NET[vmessConfig.net],
        security: (vmessConfig.tls as any) ?? 'none',
        httpSettings:
          VMESS_SHARE_NET[vmessConfig.net] === 'http'
            ? {
                path: vmessConfig.path ?? null,
                host: (vmessConfig.host as any) ?? null,
              }
            : null,
        kcpSettings:
          VMESS_SHARE_NET[vmessConfig.net] === 'kcp'
            ? {
                header: {
                  type: (vmessConfig.type as any) ?? null,
                },
              }
            : null,
        tcpSettings:
          VMESS_SHARE_NET[vmessConfig.net] === 'tcp'
            ? {
                header: {
                  type: vmessConfig.type as any,
                },
              }
            : null,
        wsSettings:
          VMESS_SHARE_NET[vmessConfig.net] === 'ws'
            ? {
                path: vmessConfig.path,
                headers: {
                  Host: vmessConfig.host,
                },
              }
            : null,
        quicSettings:
          VMESS_SHARE_NET[vmessConfig.net] === 'quic'
            ? {
                header: {
                  type: vmessConfig.type as any,
                },
              }
            : null,
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
    this.es.send<IConfigOutbound>('/config/getActivatedNode').subscribe((node) => {
      this.activatedNode = node;
    });
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
    this.es
      .send<IConfigOutbound[]>('/config/getNodeList')
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((list) => {
        this.localNodeList = list;
      });
  }

  updateLocalNodeList(list: IConfigOutbound[]) {
    this.loading = true;
    this.es
      .send('/config/updateNodeList', list)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(() => {
        this.getLocalNodeList();
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
      this.es.send('/config/setRunningConfig', node).subscribe(() => {
        this.getActivatedNode();
        this.getLocalNodeList();
        this.getSubscribeList();
      });
    }
  }

  getSubscribeList() {
    this.loading = true;
    this.es
      .send<ISubscribeConfig[]>('/config/getSubscribesConfig')
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((list) => {
        this.subscribeList = list;
      });
  }

  updateSubscribeList(list: ISubscribeConfig[]) {
    this.loading = true;
    this.es
      .send('/config/setSubscribesConfig', list)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(() => {
        this.getSubscribeList();
      });
  }

  getSubscribeNodesByUrl(url: string) {
    return this.http
      .get(url, { responseType: 'text', params: { time: Date.now().toString() } })
      .pipe(map((res) => atob(res)));
  }
}
