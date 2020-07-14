import { Injectable } from '@angular/core';
import { IConfigOutbound } from '@typing/config.interface';

@Injectable({ providedIn: 'root' })
export class UtilsService {
  getConfigByProtocol(node: IConfigOutbound) {
    if (node.protocol === 'vmess') {
      return node.settings.vnext[0];
    }
    if (node.protocol === 'shadowsocks') {
      return node.settings.servers[0];
    }
  }
}
