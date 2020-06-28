import { Component, Input, OnInit } from '@angular/core';
import { INode } from '@typing/node.interface';
import { SFSchema } from '@delon/form';

@Component({
  selector: 'v2ray-node-form',
  templateUrl: './node-form.component.html',
  styleUrls: ['./node-form.component.less'],
})
export class NodeFormComponent implements OnInit {
  @Input() nodeFormModel: Partial<INode>;
  nodeSchema: SFSchema = {
    type: 'object',
    required: ['type', 'server', 'port'],
    if: { properties: { type: ['vmess'] } },
    then: {
      required: ['uuid', 'alertId'],
    },
    properties: {
      type: {
        title: '协议类型',
        type: 'string',
        enum: ['ss', 'vmess'],
      },
      name: {
        title: '别名',
        type: 'string',
      },
      server: {
        title: '服务器地址',
        type: 'string',
      },
      port: {
        title: '端口',
        type: 'integer',
      },
      uuid: {
        type: 'string',
        ui: {
          visibleIf: { type: ['vmess'] },
        },
      },
    },
  };

  constructor() {}

  ngOnInit(): void {}
}
