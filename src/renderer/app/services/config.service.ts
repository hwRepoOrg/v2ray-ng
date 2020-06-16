import { Injectable } from '@angular/core';
import { INode } from '@typing/node.interface';
import { ISubscribe } from '@typing/subscribe.interface';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  nodeList: INode[] = [];
  subscribeList: ISubscribe[] = [];

  constructor() {}
}
