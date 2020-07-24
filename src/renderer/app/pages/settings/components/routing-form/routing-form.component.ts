import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IConfigRoutingRule } from '@typing/config.interface';

@Component({
  selector: 'v2ray-routing-form',
  templateUrl: './routing-form.component.html',
  styleUrls: ['./routing-form.component.less'],
})
export class RoutingFormComponent implements OnInit {
  routingFormGroup: FormGroup;
  constructor(private fb: FormBuilder) {
    this.routingFormGroup = this.fb.group({
      domainStrategy: ['IPIfNonMatch', [Validators.required]],
      rules: this.fb.array([]),
    });
  }

  ngOnInit(): void {}

  addRule() {
    (this.routingFormGroup.controls.rules as FormArray).push(this.genRuleFormGroup());
  }

  removeRule(index: number) {
    (this.routingFormGroup.controls.rules as FormArray).removeAt(index);
  }

  genRuleFormGroup(defaultValue?: Partial<IConfigRoutingRule>) {
    return this.fb.group({
      detail: [false],
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
