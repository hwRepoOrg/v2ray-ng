import { Injectable } from '@angular/core';
import { IConfigOutbound } from '@typing/config.interface';

@Injectable({ providedIn: 'root' })
export class UtilsService {
  getConfigByProtocol(node: IConfigOutbound) {
    switch (node.protocol) {
      case 'vmess':
      case 'vless':
        return node.settings.vnext[0];
      case 'shadowsocks':
        return node.settings.servers[0];
    }
  }
}
