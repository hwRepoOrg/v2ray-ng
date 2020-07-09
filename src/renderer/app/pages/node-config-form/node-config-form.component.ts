import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { IConfig } from '@typing/config.interface';

@Component({
  selector: 'v2ray-node-config-form',
  templateUrl: './node-config-form.component.html',
  styleUrls: ['./node-config-form.component.less'],
})
export class NodeConfigFormComponent implements OnInit {
  @Input() nodeConfig: IConfig;
  nodeConfigFormGroup: FormGroup;

  constructor() {}

  ngOnInit(): void {}
}
