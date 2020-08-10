import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ISFSchema } from '@renderer/interfaces/form-schema.interface';
import { ISubscribeConfig } from '@typing/config.interface';

@Component({
  selector: 'v2ray-subscribe-form',
  templateUrl: './subscribe-form.component.html',
  styleUrls: ['./subscribe-form.component.less'],
})
export class SubscribeFormComponent implements OnInit {
  public schema: ISFSchema<ISubscribeConfig> = {
    type: 'object',
    required: ['title', 'url'],
    properties: {
      title: { type: 'string', title: '名称' },
      url: {
        type: 'string',
        title: '订阅地址',
        ui: {
          widget: 'textarea',
          autosize: {
            minRows: 3,
          },
        },
      },
    },
  };
  @Input() record: Partial<ISubscribeConfig>;
  @Output() formSubmit = new EventEmitter<Partial<ISubscribeConfig>>();

  constructor() {}

  ngOnInit(): void {}
}
