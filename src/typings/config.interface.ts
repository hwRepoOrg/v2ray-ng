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
  tcpSettings?: {};
  kcpSettings?: {};
  wsSettings?: {};
  httpSettings?: {};
  dsSettings?: {};
  quicSettings?: {};
}

export interface IConfigInbound {
  port: number;
  listen: string;
  protocol: ProtocolType;
}

export interface IConfigProtocolSettings {
  dolodemo: {};
}
