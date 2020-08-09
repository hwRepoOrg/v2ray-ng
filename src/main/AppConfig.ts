import { IConfig, IConfigInbound, IConfigOutbound, IConfigRouting, ISubscribeConfig } from '@typing/config.interface';
import { app } from 'electron';
import { EventEmitter } from 'events';
import { existsSync, mkdirSync, pathExists, readFile, writeFile } from 'fs-extra';
import * as Path from 'path';

export class AppConfig extends EventEmitter {
  public configPath: string;
  public nodeListPath: string;
  public routingConfigPath: string;
  public inboundsConfigPath: string;
  public runningConfigPath: string;
  public subscribesConfigPath: string;

  constructor() {
    super();
    this.configPath = Path.resolve(app.getPath('appData'), 'v2ray-ng');
    if (!existsSync(this.configPath)) {
      mkdirSync(this.configPath);
    }
    this.nodeListPath = Path.resolve(this.configPath, 'node-list.json');
    this.routingConfigPath = Path.resolve(this.configPath, 'routing-config.json');
    this.inboundsConfigPath = Path.resolve(this.configPath, 'inbounds-config.json');
    this.runningConfigPath = Path.resolve(this.configPath, 'running-config.json');
    this.subscribesConfigPath = Path.resolve(this.configPath, 'subscribes-config.json');
  }

  public async getNodeConfigList(): Promise<IConfigOutbound[]> {
    const hasConfig = await pathExists(this.nodeListPath);
    if (!hasConfig) {
      return [];
    } else {
      return JSON.parse((await readFile(Path.resolve(this.nodeListPath))).toString());
    }
  }

  public async setNodeConfigList(nodeList: IConfigOutbound[]) {
    await writeFile(this.nodeListPath, JSON.stringify(nodeList, null, 2));
  }

  public async updateNodeConfig(nodeConfig: IConfigOutbound) {
    const nodeList: IConfigOutbound[] = JSON.parse((await readFile(this.nodeListPath)).toString());
    const newNodeList = nodeList.map((node) => (node.tag === nodeConfig.tag ? nodeConfig : node));
    await writeFile(this.nodeListPath, JSON.stringify(newNodeList, null, 2));
  }

  public async getRoutingConfig(): Promise<IConfigRouting> {
    const hasConfig = await pathExists(this.routingConfigPath);
    if (!hasConfig) {
      return {
        domainStrategy: 'IPIfNonMatch',
        rules: [
          { detail: true, type: 'field', network: 'udp', port: 53, outboundTag: 'dns-out' },
          { type: 'field', ip: ['geoip:cn', 'geoip:private'], outboundTag: 'direct' },
          {
            type: 'field',
            domain: ['geosite:cn', 'dlc:geolocation-cn'],
            outboundTag: 'direct',
          },
          { type: 'field', domain: ['dlc:category-ads'], outboundTag: 'block' },
          { type: 'field', domain: ['dlc:geolocation-!cn', 'dlc:speedtest'], outboundTag: 'proxy' },
        ],
      };
    } else {
      return JSON.parse((await readFile(this.routingConfigPath)).toString());
    }
  }

  public async setRoutingConfig(routingConfig: IConfigRouting) {
    await writeFile(this.routingConfigPath, JSON.stringify(routingConfig, null, 2));
  }

  public async getInboundsConfig(): Promise<IConfigInbound[]> {
    const hasConfig = await pathExists(this.inboundsConfigPath);
    if (!hasConfig) {
      return [
        {
          tag: 'socks-inbound',
          protocol: 'socks',
          listen: '127.0.0.1',
          port: 1080,
          settings: { udp: true, ip: '127.0.0.1' },
        },
        {
          tag: 'http(s)-inbound',
          protocol: 'http',
          listen: '127.0.0.1',
          port: 1087,
          sniffing: { enabled: true, destOverride: ['http', 'tls'] },
        },
      ];
    } else {
      return JSON.parse((await readFile(this.inboundsConfigPath)).toString());
    }
  }

  public async setInboundsConfig(inboundsConfig: IConfigInbound[]) {
    await writeFile(this.inboundsConfigPath, JSON.stringify(inboundsConfig, null, 2));
  }

  public async setRunningConfig(node: IConfigOutbound): Promise<IConfig> {
    const routing = await this.getRoutingConfig();
    const inbounds = await this.getInboundsConfig();
    const config: IConfig = {
      log: { loglevel: 'debug' },
      inbounds,
      routing,
      outbounds: [
        { ...node, tag: 'proxy', nodeTag: node.tag },
        {
          protocol: 'freedom',
          tag: 'direct',
          settings: {
            domainStrategy: 'UseIP',
          },
        },
        { protocol: 'dns', tag: 'dns-out' },
        {
          tag: 'block',
          protocol: 'blackhole',
          settings: {
            response: {
              type: 'http',
            },
          },
        },
      ],
    };
    await writeFile(this.runningConfigPath, JSON.stringify(config, null, 2));
    return config;
  }

  public async getRunningConfig(): Promise<IConfig | null> {
    const hasConfig = await pathExists(this.runningConfigPath);
    if (!hasConfig) {
      return null;
    }
    return JSON.parse((await readFile(this.runningConfigPath)).toString());
  }

  public async getActivatedNode(): Promise<IConfigOutbound | null> {
    const hasConfig = await pathExists(this.runningConfigPath);
    if (!hasConfig) {
      return null;
    }
    const runningConfig = JSON.parse((await readFile(this.runningConfigPath)).toString()) as IConfig;
    return runningConfig.outbounds.find((out) => out.tag === 'proxy');
  }

  public async getSubscribesConfig(): Promise<ISubscribeConfig[]> {
    const hasConfig = await pathExists(this.subscribesConfigPath);
    if (!hasConfig) {
      return [];
    }
    return JSON.parse((await readFile(this.subscribesConfigPath)).toString());
  }

  public async setSubscribesConfig(list: ISubscribeConfig[]) {
    return await writeFile(this.subscribesConfigPath, JSON.stringify(list, null, 2));
  }
}
