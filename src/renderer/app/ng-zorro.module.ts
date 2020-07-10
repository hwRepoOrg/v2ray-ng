import { NgModule } from '@angular/core';
import { IconDefinition } from '@ant-design/icons-angular';
import * as AllIcons from '@ant-design/icons-angular/icons';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzResizableModule } from 'ng-zorro-antd/resizable';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

const antDesignIcons = AllIcons as {
  [key: string]: IconDefinition;
};
const icons: IconDefinition[] = Object.keys(antDesignIcons).map((key) => antDesignIcons[key]);

const ANTD_MODULES = [
  NzToolTipModule,
  NzResizableModule,
  NzMenuModule,
  NzLayoutModule,
  NzCardModule,
  NzFormModule,
  NzRadioModule,
  NzTagModule,
  NzDrawerModule,
  NzCollapseModule,
  NzMessageModule,
  NzInputModule,
];

@NgModule({
  imports: [NzIconModule.forRoot(icons), ...ANTD_MODULES],
  exports: [NzIconModule, ...ANTD_MODULES],
})
export class NgZorroModule {}
