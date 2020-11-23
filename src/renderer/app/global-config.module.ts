import { ModuleWithProviders, NgModule } from '@angular/core';
import { NzConfig, NZ_CONFIG } from 'ng-zorro-antd/core/config';

const ngZorroConfig: NzConfig = {
  card: {
    nzSize: 'small',
  },
  table: {
    nzSize: 'middle',
  },
  button: {
    nzSize: 'small',
  },
};

const zorroProvides = [{ provide: NZ_CONFIG, useValue: ngZorroConfig }];

// #endregion

@NgModule({})
export class GlobalConfigModule {
  static forRoot(): ModuleWithProviders<GlobalConfigModule> {
    return {
      ngModule: GlobalConfigModule,
      providers: [...zorroProvides],
    };
  }
}
