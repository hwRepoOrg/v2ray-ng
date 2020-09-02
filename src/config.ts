import { IConfig, IConfigInbound, IConfigRouting } from '@typing/config.interface';

export const DEFAULT_INBOUNDS: IConfigInbound[] = [
  {
    tag: 'socks-inbound',
    protocol: 'socks',
    listen: '127.0.0.1',
    port: 1080,
    settings: { udp: true, ip: '127.0.0.1' },
  },
  {
    tag: 'http(s)-inbound',
    protocol: 'http',
    listen: '127.0.0.1',
    port: 1087,
    sniffing: { enabled: true, destOverride: ['http', 'tls'] },
  },
];

export const DEFAULT_ROUTING: IConfigRouting = {
  domainStrategy: 'IPIfNonMatch',
  rules: [
    { detail: true, type: 'field', network: 'udp', port: 53, outboundTag: 'dns-out' },
    { type: 'field', ip: ['geoip:cn', 'geoip:private'], outboundTag: 'direct' },
    {
      type: 'field',
      domain: ['geosite:cn', 'dlc:geolocation-cn'],
      outboundTag: 'direct',
    },
    { type: 'field', domain: ['dlc:category-ads'], outboundTag: 'block' },
    { type: 'field', domain: ['dlc:geolocation-!cn', 'dlc:speedtest'], outboundTag: 'proxy' },
  ],
};

export const DEFAULT_CONFIG_TEMPLATE: IConfig = {
  log: { loglevel: 'debug' },
  dns: { servers: ['114.114.114.114', '223.5.5.5'] },
  outbounds: [
    {
      protocol: 'freedom',
      tag: 'direct',
      settings: {
        domainStrategy: 'UseIPv4',
      },
    },
    { protocol: 'dns', tag: 'dns-out' },
    {
      tag: 'block',
      protocol: 'blackhole',
      settings: {
        response: {
          type: 'http',
        },
      },
    },
  ],
};
