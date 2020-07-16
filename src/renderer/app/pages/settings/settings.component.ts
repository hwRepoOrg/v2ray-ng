import { Component, OnInit } from '@angular/core';
import { ISFSchema } from '@renderer/interfaces/form-schema.interface';

@Component({
  selector: 'v2ray-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.less'],
})
export class SettingsComponent implements OnInit {
  settingsFormSchema: ISFSchema = {
    type: 'object',
    properties: {},
  };
  constructor() {}

  ngOnInit(): void {}
}
