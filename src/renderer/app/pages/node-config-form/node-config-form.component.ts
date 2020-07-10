import { Component, Input, OnInit } from '@angular/core';
import { ISFSchema } from '@renderer/interfaces/form-schema.interface';
import { IConfigOutbound } from '@typing/config.interface';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NodeConfigSchema } from './schema';
@Component({
  selector: 'v2ray-node-config-form',
  templateUrl: './node-config-form.component.html',
  styleUrls: ['./node-config-form.component.less'],
})
export class NodeConfigFormComponent implements OnInit {
  @Input() nodeConfig: IConfigOutbound;
  nodeFormSchema: ISFSchema<IConfigOutbound> = NodeConfigSchema;
  constructor(private msgSrv: NzMessageService) {}
  ngOnInit(): void {}

  parse(value: string) {
    let result: any;
    try {
      result = JSON.parse(value);
      return JSON.parse(value);
    } catch (err) {
      return value;
    }
  }
}
