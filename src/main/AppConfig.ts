import { IConfigOutbound } from '@typing/config.interface';
import { app } from 'electron';
import { EventEmitter } from 'events';
import { existsSync, mkdirSync, pathExists, readFile, readFileSync, writeFile } from 'fs-extra';
import * as Path from 'path';

export class AppConfig extends EventEmitter {
  private configPath: string;
  private nodeListPath: string;

  constructor() {
    super();
    this.configPath = app.getPath('appData') + '/v2ray-ng';
    if (!existsSync(this.configPath)) {
      mkdirSync(this.configPath);
    }
    this.nodeListPath = Path.resolve(this.configPath, 'node-list.json');
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

  public async addNodeConfig(nodeConfig: IConfigOutbound) {
    const hasConfig = await pathExists(this.nodeListPath);
    if (!hasConfig) {
      await writeFile(this.nodeListPath, JSON.stringify([]));
    }
    const nodeList: IConfigOutbound[] = JSON.parse((await readFile(this.nodeListPath)).toString());
    nodeList.push({ ...nodeConfig, tag: `${Date.now()}${Math.round(Math.random() * 10000000)}` });
    await writeFile(this.nodeListPath, JSON.stringify(nodeList, null, 2));
  }

  public async updateNodeConfig(nodeConfig: IConfigOutbound) {
    const nodeList: IConfigOutbound[] = JSON.parse((await readFile(this.nodeListPath)).toString());
    const newNodeList = nodeList.map((node) => (node.tag === nodeConfig.tag ? nodeConfig : node));
    await writeFile(this.nodeListPath, JSON.stringify(newNodeList, null, 2));
  }

  public generatorConfig(node: IConfigOutbound) {}
}
