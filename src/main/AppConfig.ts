import { IConfigOutbound } from '@typing/config.interface';
import { app } from 'electron';
import { EventEmitter } from 'events';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs-extra';
import * as Path from 'path';

export class AppConfig extends EventEmitter {
  private configPath: string;

  constructor() {
    super();
    this.configPath = app.getPath('appData') + '/v2ray-ng';
    if (!existsSync(this.configPath)) {
      mkdirSync(this.configPath);
    }
    console.log(this.configPath);
  }

  public getNodeConfigList() {
    if (!existsSync(Path.resolve(this.configPath, 'node-list.json'))) {
      return [];
    } else {
      try {
        return JSON.parse(readFileSync(Path.resolve(this.configPath, 'node-list.json')).toString());
      } catch (err) {
        console.error(err.message);
      }
    }
  }

  public addNodeConfig(nodeConfig: IConfigOutbound) {
    try {
      const nodeListPath = Path.resolve(this.configPath, 'node-list.json');
      if (!existsSync(nodeListPath)) {
        writeFileSync(nodeListPath, JSON.stringify([]));
      }
      const nodeList: IConfigOutbound[] = JSON.parse(readFileSync(nodeListPath).toString());
      nodeList.push({ ...nodeConfig, tag: `${Date.now()}${Math.round(Math.random() * 10000000)}` });
      writeFileSync(nodeListPath, JSON.stringify(nodeList, null, 2));
      return true;
    } catch (err) {
      console.error(err.message);
      return false;
    }
  }
}
