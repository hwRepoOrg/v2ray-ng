import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IConfigInbound } from '@typing/config.interface';

@Component({
  selector: 'v2ray-input-form',
  templateUrl: './input-form.component.html',
  styleUrls: ['./input-form.component.less'],
})
export class InputFormComponent {
  public configFormGroup: FormGroup;
  public inboundsFormArray: FormArray;

  constructor(private fb: FormBuilder) {
    this.inboundsFormArray = this.fb.array([]);
    this.configFormGroup = this.fb.group({
      inbounds: this.inboundsFormArray,
    });
  }

  public submit() {
    console.log(this.inboundsFormArray.value);
  }

  public add() {
    this.inboundsFormArray.push(this.genInboundFormGroup());
  }

  public setInboundSetting(inbound: FormGroup) {
    inbound.removeControl('settings');
    inbound.addControl('settings', this.genInboundSetting(inbound.get('protocol').value));
  }

  private genInboundFormGroup(defaultValues?: Partial<IConfigInbound>) {
    return this.fb.group({
      tag: [defaultValues?.tag ?? 'default-inbound', [Validators.required]],
      port: [defaultValues?.port ?? 1080, [Validators.required]],
      listen: [defaultValues?.listen ?? '127.0.0.1'],
      protocol: [defaultValues?.protocol ?? 'socks'],
      settings: this.genInboundSetting((defaultValues?.protocol as any) ?? 'socks'),
      sniffing: this.fb.group({
        enabled: [defaultValues?.sniffing?.enabled ?? false],
        destOverride: [defaultValues?.sniffing?.destOverride],
      }),
    });
  }

  private genInboundSetting(protocol: 'socks' | 'http') {
    switch (protocol) {
      case 'socks':
        return this.fb.group({
          auth: ['noauth'],
          accounts: this.fb.array([this.fb.group({ user: [], pass: [] })]),
          udp: [false],
          ip: ['127.0.0.1'],
          userLevel: [0],
        });
      case 'http':
        return this.fb.group({
          timeout: [0],
          accounts: this.fb.array([this.fb.group({ user: [], pass: [] })]),
          allowTransparent: [false],
          userLevel: [0],
        });
    }
  }
}
