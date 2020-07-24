import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'v2ray-routing-form',
  templateUrl: './routing-form.component.html',
  styleUrls: ['./routing-form.component.less'],
})
export class RoutingFormComponent implements OnInit {
  routingFormGroup: FormGroup;
  routingRuleFormGroup: FormGroup;
  constructor(private fb: FormBuilder) {
    this.routingFormGroup = this.fb.group({
      domainStrategy: ['IPIfNonMatch', [Validators.required]],
      rules: this.fb.array([]),
    });
  }

  ngOnInit(): void {}
}
