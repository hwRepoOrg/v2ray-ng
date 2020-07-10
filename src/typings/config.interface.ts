export type InboundProtocolType = 'dokodemo' | 'http' | 'mtporoto' | 'shadowsocks' | 'socks' | 'vmess';
export type OutboundProtocolType =
  | 'blackhole'
  | 'dns'
  | 'freedom'
  | 'http'
  | 'mtporoto'
  | 'shadowsocks'
  | 'socks'
  | 'vmess';

export type ProtocolType = InboundProtocolType & OutboundProtocolType;

export interface IConfig {
  log?: IConfigLog;
  api?: IConfigApi;
  dns?: IConfigDNS;
  stats?: {};
  routing?: IConfigRouting;
  policy?: IConfigPolicy;
  reverse?: IConfigReverse;
  transport?: IConfigTransport;
  inbounds?: IConfigInbound[];
  outbounds?: IConfigOutbound[];
}

export interface IConfigLog {
  access: string;
  error: string;
  loglevel: 'debug' | 'info' | 'warning' | 'error' | 'none';
}

export interface IConfigApi {
  tag: string;
  services: string[];
}
export interface IConfigDNS {
  host: { [key: string]: string };
  servers: { address: string; port: number; domains: string[]; expectIps: string[] }[];
}

export interface IConfigRouting {
  domainStrategy: 'AsIs' | 'IPIfNonMatch' | 'IPOnDemand';
  rules: IConfigRoutingRule[];
  balancers: IConfigRoutingBalancer[];
}

export interface IConfigRoutingRule {
  type: string;
  domain: string[];
  ip: string[];
  port: number | string;
  network: 'tcp' | 'udp' | 'tcp,udp';
  source: string[];
  user: string[];
  inboundTag: [];
  protocol: ('http' | 'tls' | 'bittorrent')[];
  attrs: string;
  outboundTag: string;
  balancerTag: string;
}

export interface IConfigRoutingBalancer {
  tag: string;
  selector: string[];
}

export interface IConfigPolicy {
  level: {
    [key: string]: {
      handshake: number;
      connIdle: number;
      uplinkOnly: number;
      downlinkOnly: number;
      statsUserUplink: boolean;
      statsUserDownlink: boolean;
      bufferSize: number;
    };
  };
  system: {
    statsInboundUplink: boolean;
    statsInboundDownlink: boolean;
  };
}

export interface IConfigReverse {
  bridges: { tag: string; domain: string }[];
  portals: { tag: string; domain: string }[];
}

export interface IConfigTransport {
  tcpSettings?: IConfigTCPSetting;
  kcpSettings?: IConfigKCPSetting;
  wsSettings?: IConfigWSSetting;
  httpSettings?: IConfigHTTPSetting;
  dsSettings?: IConfigDSSetting;
  quicSettings?: IConfigQUICSetting;
}

export interface IConfigTCPSetting {
  header: {
    type: 'none' | 'http';
    request: {
      version: string;
      method: string;
      path: string[];
      headers: { [key: string]: string | string[] };
    };
    response: {
      version: string;
      status: string;
      reason: string;
      headers: { [key: string]: string | string[] };
    };
  };
}

export interface IConfigKCPSetting {
  mtu: number;
  tti: number;
  uplinkCapacity: number;
  downlinkCapacity: number;
  congestion: boolean;
  readBufferSize: number;
  writeBufferSize: number;
  header: {
    type: 'none' | 'srtp' | 'utp' | 'wechat-video' | 'dtls' | 'wireguard';
  };
}

export interface IConfigWSSetting {
  path: string;
  headers: {
    Host: string;
  };
}

export interface IConfigHTTPSetting {
  host: string[];
  path: string;
}

export interface IConfigDSSetting {
  path: string;
}

export interface IConfigQUICSetting {
  security: 'none' | 'aes-128-gcm' | 'chacha20-poly1305';
  key: string;
  header: {
    type: 'none' | 'srtp' | 'utp' | 'wechat-video' | 'dtls' | 'wireguard';
  };
}

export interface IConfigInbound {
  port: number;
  listen: string;
  protocol: InboundProtocolType;
  settings: any;
  streamSettings: IConfigStreamSetting;
  tag: string;
  sniffing: {
    enabled: boolean;
    destOverride: ('http' | 'tls')[];
  };
  allocate: {
    strategy: 'always' | 'random';
    refresh: number;
    concurrency: number;
  };
}

export interface IConfigOutbound {
  sendThrough: string;
  protocol: OutboundProtocolType;
  settings: any;
  tag: string;
  streamSettings: IConfigStreamSetting;
  proxySettings: {
    tag: string;
  };
  mux: {
    enabled: boolean;
    concurrency: number;
  };
}

export interface IConfigStreamSetting extends IConfigTransport {
  network: 'tcp' | 'kcp' | 'ws' | 'http' | 'domainsocket' | 'quic';
  security: 'none' | 'tls';
  tlsSettings: IConfigTLSSetting;
  sockopt: IConfigSockOption;
}

export interface IConfigTLSSetting {
  serverName: string;
  allowInsecure: boolean;
  alpn: string[];
  certificates: IConfigCertificate[];
  disableSystemRoot: boolean;
}

export interface IConfigCertificate {
  usage: 'encipherment' | 'verify' | 'issue';
  certificateFile: string;
  certificate: string[];
  keyFile: string;
  key: string[];
}

export interface IConfigSockOption {
  mark: number;
  tcpFastOpen: boolean;
  tproxy: 'redirect' | 'tproxy' | 'off';
}
