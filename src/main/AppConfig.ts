import { IConfig, IConfigInbound, IConfigOutbound, ISubscribeConfig } from '@typing/config.interface';
import { app } from 'electron';
import { EventEmitter } from 'events';
import { existsSync, mkdirSync, pathExists, readFile, writeFile, WriteFileOptions } from 'fs-extra';
import * as Path from 'path';
import { DEFAULT_CONFIG_TEMPLATE, DEFAULT_INBOUNDS, DEFAULT_ROUTING } from '../config';
import { setMacOSSystemProxy, setWinSystemProxy } from './utils';

export class AppConfig extends EventEmitter {
  public configPath = Path.resolve(app.getPath('appData'), 'v2ray-ng');
  public guiConfigPath: string = Path.resolve(this.configPath, 'gui-config.json');
  public nodeListPath: string = Path.resolve(this.configPath, 'node-list.json');
  public routingConfigPath = Path.resolve(this.configPath, 'routing-config.json');
  public inboundsConfigPath = Path.resolve(this.configPath, 'inbounds-config.json');
  public runningConfigPath = Path.resolve(this.configPath, 'running-config.json');
  public subscribesConfigPath = Path.resolve(this.configPath, 'subscribes-config.json');

  constructor() {
    super();
    if (!existsSync(this.configPath)) {
      mkdirSync(this.configPath);
    }
    setTimeout(() => {
      this.emit('initialed');
    }, 30);
  }

  public async getRoutingConfig() {
    return this.getConfigByPath(this.routingConfigPath, DEFAULT_ROUTING);
  }

  public async getInboundConfig() {
    return this.getConfigByPath(this.inboundsConfigPath, DEFAULT_INBOUNDS);
  }

  public async getNodeList() {
    return this.getConfigByPath(this.nodeListPath, []);
  }

  public async getSubscribesConfig() {
    return this.getConfigByPath(this.subscribesConfigPath, []);
  }

  public async updateNodeList(list: any[]) {
    return this.writeConfigByPath(this.nodeListPath, list);
  }

  public async setInboundsConfig(config: IConfigInbound[]) {
    return this.writeConfigByPath(this.inboundsConfigPath, config);
  }

  public async setRunningConfig(node: IConfigOutbound): Promise<IConfig> {
    const routing = await this.getRoutingConfig();
    const inbounds = await this.getInboundConfig();
    const config: IConfig = {
      ...DEFAULT_CONFIG_TEMPLATE,
      inbounds,
      routing,
      outbounds: [{ ...node, tag: 'proxy', nodeTag: node.tag }, ...DEFAULT_CONFIG_TEMPLATE.outbounds],
    };
    await writeFile(this.runningConfigPath, JSON.stringify(config, null, 2));
    await global.appInstance.core.start();
    if (global.appInstance.tray) {
      await this.setGuiConfig({ enabled: true });
      global.appInstance.tray.updateTrayContextMenu();
    }
    return config;
  }

  public async getActivatedNode(): Promise<IConfigOutbound | null> {
    const runningConfig = await this.getConfigByPath(this.runningConfigPath, null);
    return runningConfig && runningConfig.outbounds.find((out) => out.tag === 'proxy');
  }

  public async setSubscribesConfig(list: ISubscribeConfig[]) {
    await writeFile(this.subscribesConfigPath, JSON.stringify(list, null, 2));
    if (global.appInstance.tray) {
      global.appInstance.tray.updateTrayContextMenu();
    }
  }

  public async getGuiConfig(keys?: string[]) {
    const config = await this.getConfigByPath(this.guiConfigPath, { extensionMode: false, enabled: false } as {
      [key: string]: any;
    });
    if (!keys.length) {
      return config;
    }
    return keys.reduce((obj, key) => ({ ...obj, [key]: config[key] }), {});
  }

  public async setGuiConfig(obj: { [key: string]: any }) {
    const config = await this.getConfigByPath(this.guiConfigPath, obj);
    return await writeFile(this.guiConfigPath, JSON.stringify({ ...config, ...obj }, null, 2));
  }

  async getConfigByPath<T = any>(path: string, defaultValue?: T): Promise<T> {
    const hasConfig = await pathExists(path);
    if (!hasConfig) {
      return defaultValue;
    }
    return JSON.parse((await readFile(path)).toString());
  }

  async writeConfigByPath(path: string, value: any, options?: string | WriteFileOptions) {
    return writeFile(path, JSON.stringify(value, null, 2), options);
  }

  async setSystemProxy(...args: [boolean, 'socks' | 'http', number]) {
    switch (process.platform) {
      case 'darwin':
        return await setMacOSSystemProxy(...args);
      case 'win32':
        return await setWinSystemProxy(...args);
    }
  }
}
