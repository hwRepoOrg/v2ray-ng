import { Component, OnInit, Input } from '@angular/core';
import { INode } from '@typing/node.interface';

@Component({
  selector: 'v2ray-node-info',
  templateUrl: './node-info.component.html',
  styleUrls: ['./node-info.component.less'],
})
export class NodeInfoComponent {
  @Input() node: INode;
}
