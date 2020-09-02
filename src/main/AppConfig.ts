import { IConfig, IConfigOutbound, ISubscribeConfig } from '@typing/config.interface';
import { app } from 'electron';
import { existsSync, mkdirSync, pathExists, readFile, writeFile, WriteFileOptions } from 'fs-extra';
import * as Path from 'path';
import { DEFAULT_CONFIG_TEMPLATE, DEFAULT_INBOUNDS, DEFAULT_ROUTING } from '../config';

export class AppConfig {
  public configPath = Path.resolve(app.getPath('appData'), 'v2ray-ng');
  public guiConfigPath: string = Path.resolve(this.configPath, 'gui-config.json');
  public nodeListPath: string = Path.resolve(this.configPath, 'node-list.json');
  public routingConfigPath = Path.resolve(this.configPath, 'routing-config.json');
  public inboundsConfigPath = Path.resolve(this.configPath, 'inbounds-config.json');
  public runningConfigPath = Path.resolve(this.configPath, 'running-config.json');
  public subscribesConfigPath = Path.resolve(this.configPath, 'subscribes-config.json');

  constructor() {
    if (!existsSync(this.configPath)) {
      mkdirSync(this.configPath);
    }
  }

  public async setRunningConfig(node: IConfigOutbound): Promise<IConfig> {
    const routing = await this.getConfigByPath(this.routingConfigPath, DEFAULT_ROUTING);
    const inbounds = await this.getConfigByPath(this.inboundsConfigPath, DEFAULT_INBOUNDS);
    const config: IConfig = {
      ...DEFAULT_CONFIG_TEMPLATE,
      inbounds,
      routing,
      outbounds: [{ ...node, tag: 'proxy', nodeTag: node.tag }, ...DEFAULT_CONFIG_TEMPLATE.outbounds],
    };
    await writeFile(this.runningConfigPath, JSON.stringify(config, null, 2));
    return config;
  }

  public async getActivatedNode(): Promise<IConfigOutbound | null> {
    const runningConfig = await this.getConfigByPath(this.runningConfigPath, null);
    return runningConfig && runningConfig.outbounds.find((out) => out.tag === 'proxy');
  }

  public async setSubscribesConfig(list: ISubscribeConfig[]) {
    return await writeFile(this.subscribesConfigPath, JSON.stringify(list, null, 2));
  }

  public async getGuiConfig(keys?: string[]) {
    const config = await this.getConfigByPath(this.guiConfigPath, { proxyMode: 'manual', extensionMode: false } as {
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
    console.log(value);
    return writeFile(path, JSON.stringify(value, null, 2), options);
  }
}
