import { Component } from '@angular/core';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';

@Component({
  selector: 'v2ray-node-list',
  templateUrl: './node-list.component.html',
  styleUrls: ['./node-list.component.less'],
})
export class NodeListComponent {
  public drawerWidth = 300;
  public drawerVisible = false;
  private drawerAnimationId: number;

  constructor() {}

  onDrawerResize({ width }: NzResizeEvent): void {
    cancelAnimationFrame(this.drawerAnimationId);
    this.drawerAnimationId = requestAnimationFrame(() => {
      this.drawerWidth = width!;
    });
  }

  toggleDrawer() {
    this.drawerVisible = !this.drawerVisible;
  }
}
