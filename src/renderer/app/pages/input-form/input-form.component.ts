import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ElectronService } from '@renderer/services/electron.service';
import { IConfigInbound } from '@typing/config.interface';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'v2ray-input-form',
  templateUrl: './input-form.component.html',
  styleUrls: ['./input-form.component.less'],
})
export class InputFormComponent implements OnInit {
  public configFormGroup: FormGroup;
  public get inboundsFormArray(): FormArray {
    return this.configFormGroup.get('inbounds') as FormArray;
  }
  public loading = false;

  constructor(private fb: FormBuilder, private es: ElectronService, private msgSrv: NzMessageService) {
    this.configFormGroup = this.fb.group({
      inbounds: this.fb.array([]),
    });
  }

  ngOnInit() {
    this.loading = true;
    this.es
      .send('/config/getInboundsConfig')
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((inbounds) => {
        inbounds.forEach((inbound) => {
          this.inboundsFormArray.push(this.genInboundFormGroup(inbound));
        });
      });
  }

  public submit() {
    this.es.send('/config/setInboundsConfig', this.inboundsFormArray.value).subscribe(() => {
      this.msgSrv.success('保存成功');
    });
  }

  public add() {
    this.inboundsFormArray.push(this.genInboundFormGroup());
  }

  private genInboundFormGroup(defaultValues?: Partial<IConfigInbound>) {
    return this.fb.group({
      tag: [defaultValues?.tag ?? 'default-inbound', [Validators.required]],
      port: [defaultValues?.port ?? 1080, [Validators.required]],
      listen: [defaultValues?.listen ?? '127.0.0.1'],
      protocol: [defaultValues?.protocol ?? 'socks'],
      settings: this.genInboundSetting((defaultValues?.protocol as any) ?? 'socks', defaultValues?.settings),
      sniffing: this.fb.group({
        enabled: [defaultValues?.sniffing?.enabled ?? false],
        destOverride: [defaultValues?.sniffing?.destOverride],
      }),
    });
  }

  private genInboundSetting(protocol: 'socks' | 'http', defaultValue?: any) {
    switch (protocol) {
      case 'socks':
        return this.fb.group({
          auth: [defaultValue?.auth ?? 'noauth'],
          accounts: this.fb.array(
            defaultValue?.accounts?.map((account) => this.fb.group({ user: [account.user], pass: [account.pass] })) ?? [
              this.fb.group({ user: [], pass: [] }),
            ]
          ),
          udp: [defaultValue?.udp],
          ip: [defaultValue?.ip ?? '127.0.0.1'],
          userLevel: [defaultValue?.userLevel ?? 0],
        });
      case 'http':
        return this.fb.group({
          timeout: [defaultValue?.timeout ?? 0],
          accounts: this.fb.array(
            defaultValue?.accounts?.map((account) => this.fb.group({ user: [account.user], pass: [account.pass] })) ?? [
              this.fb.group({ user: [], pass: [] }),
            ]
          ),
          allowTransparent: [defaultValue?.allowTransparent ?? false],
          userLevel: [defaultValue?.userLevel ?? 0],
        });
    }
  }
}
