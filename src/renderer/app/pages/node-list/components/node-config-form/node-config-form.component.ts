import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { JsonToObjectPipe } from '@renderer/commons/pipes/json-to-object.pipe';
import { IConfigOutbound } from '@typing/config.interface';

function JSONHeaderValidatorFn(control: AbstractControl): ValidationErrors | null {
  if (typeof control.value === 'string') {
    return { syntax: 'json解析错误' };
  } else {
    return null;
  }
}

@Component({
  selector: 'v2ray-node-config-form',
  templateUrl: './node-config-form.component.html',
  styleUrls: ['./node-config-form.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [JsonToObjectPipe],
})
export class NodeConfigFormComponent implements OnInit {
  @Input()
  nodeConfig: IConfigOutbound;
  @Output() public whenSubmit = new EventEmitter<IConfigOutbound>();
  public nodeConfigFormGroup: FormGroup;
  bufferSizeFormatter = (value: number) => `${value} MB`;
  bufferSizeParser = (value: string) => value.replace(' MB', '');
  get settings() {
    return this.nodeConfigFormGroup.get('settings');
  }
  get streamSettings() {
    return this.nodeConfigFormGroup.get('streamSettings');
  }
  get tlsSettings() {
    return this.nodeConfigFormGroup.get('streamSettings').get('tlsSettings');
  }
  get tcpSettings() {
    return this.nodeConfigFormGroup.get('streamSettings').get('tcpSettings');
  }
  get kcpSettings() {
    return this.nodeConfigFormGroup.get('streamSettings').get('kcpSettings');
  }
  get wsSettings() {
    return this.nodeConfigFormGroup.get('streamSettings').get('wsSettings');
  }
  get httpSettings() {
    return this.nodeConfigFormGroup.get('streamSettings').get('httpSettings');
  }
  get dsSettings() {
    return this.nodeConfigFormGroup.get('streamSettings').get('dsSettings');
  }
  get quicSettings() {
    return this.nodeConfigFormGroup.get('streamSettings').get('quicSettings');
  }

  constructor(public fb: FormBuilder, public jto: JsonToObjectPipe) {}

  ngOnInit(): void {
    this.initNodeConfigFormGroup(this.nodeConfig);
  }

  initNodeConfigFormGroup(nodeConfig: IConfigOutbound) {
    this.nodeConfigFormGroup = this.fb.group({
      name: [nodeConfig?.name],
      protocol: [nodeConfig?.protocol ?? 'shadowsocks', [Validators.required]],
      settings: this.getSettingsGroup((nodeConfig?.protocol as any) ?? 'shadowsocks'),
      streamSettings: this.fb.group({
        network: nodeConfig?.streamSettings?.network ?? 'tcp',
        security: nodeConfig?.streamSettings?.security ?? 'none',
        tlsSettings: this.getTlsSettingsGroup(nodeConfig?.streamSettings?.tlsSettings),
        tcpSettings: this.getTcpSettingsGroup(nodeConfig?.streamSettings?.tcpSettings),
        kcpSettings: this.getKcpSettingsGroup(nodeConfig?.streamSettings?.kcpSettings),
        wsSettings: this.getWsSettingsGroup(nodeConfig?.streamSettings?.wsSettings),
        httpSettings: this.getHttpSettingsGroup(nodeConfig?.streamSettings?.httpSettings),
        dsSettings: this.getDsSettingsGroup(nodeConfig?.streamSettings?.dsSettings),
        quicSettings: this.getQuicSettingsGroup(nodeConfig?.streamSettings?.quicSettings),
      }),
    });
    if (nodeConfig) {
      this.nodeConfigFormGroup.patchValue(nodeConfig);
      if (nodeConfig?.settings?.servers[0]) {
        (this.nodeConfigFormGroup.get('settings').get('servers') as FormArray).controls[0].patchValue(
          nodeConfig?.settings?.servers[0]
        );
      }
      if (nodeConfig?.settings?.vnext[0]) {
        (this.nodeConfigFormGroup.get('settings').get('vnext') as FormArray).controls[0].patchValue(
          nodeConfig?.settings?.vnext[0]
        );
      }
    }
  }

  getSettingsGroup(protocol: 'shadowsocks' | 'vmess' | 'vless') {
    switch (protocol) {
      case 'shadowsocks':
        return this.fb.group({
          servers: this.fb.array([
            this.fb.group({
              address: [, [Validators.required]],
              port: [443, [Validators.required]],
              method: ['aes-256-cfb', [Validators.required]],
              password: [, [Validators.required]],
            }),
          ]),
        });
      case 'vmess':
        return this.fb.group({
          vnext: this.fb.array([
            this.fb.group({
              address: [, [Validators.required]],
              port: [443, [Validators.required]],
              users: this.fb.array([
                this.fb.group({
                  id: [, [Validators.required]],
                  alertId: 0,
                  security: ['auto', [Validators.required]],
                  level: [0],
                }),
              ]),
            }),
          ]),
        });
      case 'vless':
        return this.fb.group({
          vnext: this.fb.array([
            this.fb.group({
              address: [, [Validators.required]],
              port: [443, [Validators.required]],
              users: this.fb.array([
                this.fb.group({
                  id: [, [Validators.required]],
                  encryption: ['none', [Validators.required]],
                  level: [0],
                }),
              ]),
            }),
          ]),
        });
    }
  }

  setSettingsGroup(protocol: 'shadowsocks' | 'vmess') {
    this.nodeConfigFormGroup.setControl('settings', this.getSettingsGroup(protocol));
  }

  getTlsSettingsGroup(value: any) {
    return this.fb.group({
      serverName: value?.serverName,
      allowInsecure: value?.allowInsecure ?? false,
      disableSystemRoot: value?.disableSystemRoot ?? false,
      alpn: value?.alpn ?? 'http/1.1',
    });
  }

  getTcpSettingsGroup(value: any) {
    return this.fb.group({
      header: this.fb.group({
        type: value?.header.type ?? 'none',
        request: this.fb.group({
          version: value?.header?.request?.version,
          method: value?.header?.request?.method,
          path: [value?.header?.request?.path ?? ['/']],
          headers: [value?.header?.request?.headers, [JSONHeaderValidatorFn]],
        }),
        response: this.fb.group({
          version: value?.header?.response?.version,
          method: value?.header?.response?.method,
          path: [value?.header?.response?.path ?? ['/']],
          headers: [value?.header?.response?.headers, [JSONHeaderValidatorFn]],
        }),
      }),
    });
  }

  getKcpSettingsGroup(value: any) {
    return this.fb.group({
      mtu: value?.mtu ?? 1350,
      tti: value?.tti ?? 50,
      congestion: value?.congestion ?? false,
      uplinkCapacity: value?.uplinkCapacity ?? 5,
      downlinkCapacity: value?.downlinkCapacity ?? 20,
      readBufferSize: value?.readBufferSize ?? 2,
      writeBufferSize: value?.writeBufferSize ?? 2,
    });
  }

  getWsSettingsGroup(value: any) {
    return this.fb.group({
      path: value?.path,
      headers: [value?.headers, [JSONHeaderValidatorFn]],
    });
  }

  getHttpSettingsGroup(value: any) {
    return this.fb.group({
      host: value?.host,
      path: value?.path,
    });
  }

  getDsSettingsGroup(value: any) {
    return this.fb.group({ path: value?.path });
  }

  getQuicSettingsGroup(value: any) {
    return this.fb.group({ security: value?.security ?? 'none', key: value?.key, header: value?.header });
  }

  setHeadersValue(control: AbstractControl, value: string) {
    control.patchValue(this.jto.transform(value, true));
  }
}
