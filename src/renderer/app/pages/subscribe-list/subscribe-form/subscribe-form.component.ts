import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ISubscribeConfig } from '@typing/config.interface';

@Component({
  selector: 'v2ray-subscribe-form',
  templateUrl: './subscribe-form.component.html',
  styleUrls: ['./subscribe-form.component.less'],
})
export class SubscribeFormComponent implements OnInit {
  public formGroup: FormGroup;
  @Input() record: Partial<ISubscribeConfig>;
  @Output() formSubmit = new EventEmitter<Partial<ISubscribeConfig>>();

  constructor(private fb: FormBuilder) {
    this.formGroup = this.fb.group({
      title: [, [Validators.required]],
      url: [, [Validators.required]],
    });
  }

  ngOnInit(): void {
    if (this.record) {
      this.formGroup.patchValue(this.record);
    }
  }
}
