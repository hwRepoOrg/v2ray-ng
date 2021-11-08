import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfigService } from '@renderer/services/config.service';
import { ElectronService } from '@renderer/services/electron.service';
import { IConfigRoutingRule } from '@typing/config.interface';
import { NzMessageService } from 'ng-zorro-antd/message';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'v2ray-routing-form',
  templateUrl: './routing-form.component.html',
  styleUrls: ['./routing-form.component.less'],
})
export class RoutingFormComponent implements OnInit {
  public outboundTypeMap = new Map([
    ['proxy', '代理'],
    ['direct', '直连'],
    ['dns-out', 'DNS'],
    ['block', '屏蔽'],
  ]);
  public routingFormGroup: FormGroup;
  public loading = false;

  constructor(
    private fb: FormBuilder,
    private es: ElectronService,
    private msgSrv: NzMessageService,
    private cs: ConfigService
  ) {
    this.routingFormGroup = this.fb.group({
      domainStrategy: ['IPIfNonMatch', [Validators.required]],
      rules: this.fb.array([]),
    });
  }

  ngOnInit() {
    this.loading = true;
    this.es
      .send('/config/getRoutingConfig')
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((routing) => {
        this.routingFormGroup.patchValue(routing);
        routing.rules?.forEach((rule) => {
          (this.routingFormGroup.get('rules') as FormArray).push(this.genRuleFormGroup(rule));
        });
      });
  }

  submit() {
    this.es.send('/config/setRoutingConfig', this.routingFormGroup.value).subscribe(() => {
      this.msgSrv.success('保存成功');
    });
  }

  addRule() {
    (this.routingFormGroup.controls.rules as FormArray).push(this.genRuleFormGroup());
  }

  removeRule(index: number) {
    (this.routingFormGroup.controls.rules as FormArray).removeAt(index);
  }

  genRuleFormGroup(defaultValue?: Partial<IConfigRoutingRule>) {
    return this.fb.group({
      detail: [defaultValue?.detail],
      type: [defaultValue?.type ?? 'field', [Validators.required]],
      domain: [defaultValue?.domain],
      ip: [defaultValue?.ip],
      port: [defaultValue?.port],
      network: [defaultValue?.network],
      source: [defaultValue?.source],
      user: [defaultValue?.user],
      inboundTag: [defaultValue?.inboundTag],
      protocol: [defaultValue?.protocol],
      attrs: [defaultValue?.attrs],
      outboundTag: [defaultValue?.outboundTag],
      balancerTag: [defaultValue?.balancerTag],
    });
  }
}
