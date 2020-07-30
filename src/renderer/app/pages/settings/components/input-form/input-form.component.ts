import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ElectronService } from '@renderer/services/electron.service';
import { IConfigInbound } from '@typing/config.interface';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'v2ray-input-form',
  templateUrl: './input-form.component.html',
  styleUrls: ['./input-form.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputFormComponent implements OnInit {
  public configFormGroup: FormGroup;
  public get inboundsFormArray(): FormArray {
    return this.configFormGroup.get('inbounds') as FormArray;
  }
  public loading = false;

  constructor(
    private fb: FormBuilder,
    private electronSrv: ElectronService,
    private cdr: ChangeDetectorRef,
    private msgSrv: NzMessageService
  ) {
    this.configFormGroup = this.fb.group({
      inbounds: this.fb.array([]),
    });
  }

  ngOnInit() {
    this.loading = true;
    this.electronSrv.app.config
      .getInboundsConfig()
      .then((inbounds) => {
        inbounds.forEach((inbound) => {
          this.inboundsFormArray.push(this.genInboundFormGroup(inbound));
        });
      })
      .catch((err) => {
        this.msgSrv.error(err.message);
      })
      .finally(() => {
        this.loading = false;
        this.cdr.detectChanges();
      });
  }

  public submit() {
    this.electronSrv.app.config
      .setInboundsConfig(this.inboundsFormArray.value)
      .then(() => {
        this.msgSrv.success('保存成功');
      })
      .catch((err) => {
        this.msgSrv.error(err.message);
      });
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
