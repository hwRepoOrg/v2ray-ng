import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { SFComponent } from '@delon/form';
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
  public get formValid(): boolean {
    return this.nodeConfigForm?.valid;
  }
  @Input()
  public set nodeConfig(val: IConfigOutbound) {
    const vnext = (val.settings?.vnext && val.settings.vnext[0]) ?? {};
    const servers = (val.settings?.servers && val.settings.servers[0]) ?? {};
    this._nodeConfig = {
      ...val,
      settings: {
        ...val.settings,
        servers,
        vnext,
      },
    };
  }
  public get nodeConfig(): IConfigOutbound {
    return this._nodeConfig;
  }
  public nodeFormSchema: ISFSchema<IConfigOutbound> = NodeConfigSchema;
  @ViewChild('nodeConfigForm', { read: SFComponent }) public nodeConfigForm: SFComponent;
  @Output() public whenSubmit = new EventEmitter<IConfigOutbound>();
  private _nodeConfig: any;

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

  submit() {
    if (this.nodeConfigForm.valid) {
      const formValue = this.nodeConfigForm.value;
      this.whenSubmit.emit({
        ...formValue,
        settings: {
          ...formValue.settings,
          servers: formValue.settings.servers ? [formValue.settings.servers] : [],
          vnext: formValue.settings.vnext ? [formValue.settings.vnext] : [],
        },
      } as IConfigOutbound);
    }
  }
}
