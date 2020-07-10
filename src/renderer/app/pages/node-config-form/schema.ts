import { ISFSchema } from '@renderer/interfaces/form-schema.interface';
import { IConfigOutbound } from '@typing/config.interface';

export const NodeConfigSchema: ISFSchema<IConfigOutbound> = {
  type: 'object',
  properties: {
    protocol: { title: '选择协议', type: 'string', default: 'shadowsocks', enum: ['vmess', 'shadowsocks'] },
    servers: {
      title: '服务器配置',
      type: 'object',
      required: ['address', 'port', 'method', 'password'],
      ui: {
        visibleIf: { protocol: ['shadowsocks'] },
        type: 'card',
        cardSize: 'small',
        spanLabelFixed: 150,
        grid: { gutter: 8, span: 24 },
      },
      properties: {
        address: { title: '服务器地址', type: 'string', ui: { grid: { span: 24 } } },
        port: { title: '端口', type: 'number', default: 443, ui: { min: 1, max: 99999, grid: { span: 8 } } },
        method: {
          title: '加密方式',
          type: 'string',
          default: 'aes-256-cfb',
          enum: [
            'aes-256-cfb',
            'aes-128-cfb',
            'chacha20',
            'chacha20-ietf',
            'aes-256-gcm',
            'aes-128-gcm',
            'chacha20-poly1305',
            'chacha20-ietf-poly1305',
          ],
          ui: { widget: 'select', grid: { span: 16 } },
        },
        password: { title: '密码', type: 'string', ui: { grid: { span: 24 } } },
      },
    },
    vnext: {
      type: 'object',
      title: '服务器配置',
      required: ['address', 'port'],
      ui: {
        visibleIf: { protocol: ['vmess'] },
        type: 'card',
        cardSize: 'small',
        grid: { gutter: 8 },
        spanLabelFixed: 150,
      },
      properties: {
        address: { title: '服务器地址', type: 'string', ui: { grid: { span: 16 } } },
        port: { title: '端口', type: 'number', default: 443, minimum: 1, maximum: 99999, ui: { grid: { span: 8 } } },
        users: {
          title: '用户配置',
          type: 'object',
          required: ['id', 'security'],
          ui: { grid: { span: 24 } },
          properties: {
            id: { title: 'uuid', type: 'string' },
            alertId: { type: 'number', minimum: 0, ui: { grid: { span: 7 } } },
            security: {
              title: '加密方式',
              type: 'string',
              default: 'none',
              enum: ['aes-128-gcm', 'chacha20-poly1305', 'auto', 'none'],
              ui: { widget: 'select', grid: { span: 10 } },
            },
            level: { title: '用户等级', type: 'number', default: 0, ui: { grid: { span: 7 } } },
          },
        },
      },
    },
    streamSettings: {
      title: '传输配置',
      type: 'object',
      ui: { type: 'card', cardSize: 'small', expand: false },
      properties: {
        network: {
          type: 'string',
          default: 'tcp',
          enum: ['tcp', 'mKcp', 'ws', 'http/2', 'domainSocket', 'quic'],
          ui: {
            widget: 'select',
            spanLabelFixed: 150,
          },
        },
        security: {
          type: 'string',
          default: 'none',
          enum: ['none', 'tls'],
          ui: { widget: 'select', spanLabelFixed: 150 },
        },
        tlsSettings: {
          type: 'object',
          ui: {
            type: 'card',
            cardSize: 'small',
            visibleIf: {
              '/streamSettings/security': ['tls'],
            },
            spanLabelFixed: 150,
            grid: { span: 24, gutter: 8 },
          },
          properties: {
            serverName: { type: 'string', ui: { grid: { span: 24 } } },
            allowInsecure: { type: 'boolean', ui: { grid: { span: 12 }, spanLabelFixed: 150 } },
            disableSystemRoot: { type: 'boolean', ui: { grid: { span: 12 }, spanLabelFixed: 150 } },
            alpn: { type: 'string', enum: ['http/1.1'], default: ['http/1.1'], ui: { widget: 'select', mode: 'tags' } },
          },
        },
        tcpSettings: {
          type: 'object',
          ui: {
            type: 'card',
            cardSize: 'small',
            visibleIf: { '/streamSettings/network': ['tcp'] },
            spanLabelFixed: 150,
          },
          properties: {
            header: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  default: 'none',
                  enum: ['none', 'http'],
                  ui: {
                    widget: 'select',
                  },
                },
                request: {
                  type: 'object',
                  ui: {
                    type: 'card',
                    cardSize: 'small',
                    visibleIf: { '/streamSettings/tcpSettings/header/type': ['http'] },
                    grid: { span: 24, gutter: 8 },
                  },
                  properties: {
                    version: { type: 'string', ui: { spanLabelFixed: 80, grid: { span: 7 } } },
                    method: { type: 'string', ui: { spanLabelFixed: 80, grid: { span: 7 } } },
                    path: {
                      type: 'string',
                      enum: ['/'],
                      default: ['/'],
                      ui: { spanLabelFixed: 80, grid: { span: 10 }, widget: 'select', mode: 'tags' },
                    },
                    headers: {
                      type: 'string',
                      default: {},
                      ui: {
                        widget: 'custom',
                        validator: (value) => {
                          if (typeof value === 'string') {
                            return [
                              {
                                keyword: 'json-parse',
                                message: 'json序列化失败',
                              },
                            ];
                          }
                          return [];
                        },
                      },
                    },
                  },
                },
                response: {
                  type: 'object',
                  ui: {
                    type: 'card',
                    cardSize: 'small',
                    visibleIf: { '/streamSettings/tcpSettings/header/type': ['http'] },
                    grid: { span: 24, gutter: 8 },
                  },
                  properties: {
                    version: { type: 'string', ui: { spanLabelFixed: 80, grid: { span: 7 } } },
                    method: { type: 'string', ui: { spanLabelFixed: 80, grid: { span: 7 } } },
                    path: {
                      type: 'string',
                      enum: ['/'],
                      default: ['/'],
                      ui: { spanLabelFixed: 80, grid: { span: 10 }, widget: 'select', mode: 'tags' },
                    },
                    headers: {
                      type: 'string',
                      default: {},
                      ui: {
                        widget: 'custom',
                        validator: (value) => {
                          if (typeof value === 'string') {
                            return [
                              {
                                keyword: 'json-parse',
                                message: 'json序列化失败',
                              },
                            ];
                          }
                          return [];
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        kcpSettings: { type: 'object', ui: { visibleIf: { '/streamSettings/network': ['mKcp'] } }, properties: {} },
        wsSettings: { type: 'object', ui: { visibleIf: { '/streamSettings/network': ['ws'] } }, properties: {} },
        httpSettings: { type: 'object', ui: { visibleIf: { '/streamSettings/network': ['http/2'] } }, properties: {} },
        dsSettings: {
          type: 'object',
          ui: { visibleIf: { '/streamSettings/network': ['domainSocket'] } },
          properties: {},
        },
        quicSettings: { type: 'object', ui: { visibleIf: { '/streamSettings/network': ['quic'] } }, properties: {} },
      },
    },
  },
};
