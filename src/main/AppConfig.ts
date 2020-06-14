import { INode } from '@typing/node.interface';
import { ISubscribe } from '@typing/subscribe.interface';
import { EventEmitter } from 'events';
import { readJsonSync, writeJsonSync } from 'fs-extra';
import * as path from 'path';

export class AppConfig extends EventEmitter {
  private homePath = process.env.HOME;

  saveNodeConfig(nodes: INode[]) {
    writeJsonSync(path.resolve(this.homePath, './.v2ray-ng/nodes.json'), nodes);
    return nodes;
  }

  saveSubscribeConfig(subscribes: ISubscribe[]) {
    writeJsonSync(path.resolve(this.homePath, './.v2ray-ng/nodes.json'), subscribes);
    return subscribes;
  }

  getNodes() {
    return readJsonSync(path.resolve(this.homePath, './.v2ray-ng/nodes.json'), { throws: false }) || [];
  }

  getSubscribes() {
    return readJsonSync(path.resolve(this.homePath, './.v2ray-ng/nodes.json'), { throws: false }) || [];
  }
}
