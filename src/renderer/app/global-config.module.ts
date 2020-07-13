import { ModuleWithProviders, NgModule } from '@angular/core';
import { AlainThemeModule } from '@delon/theme';
import { AlainConfig, AlainConfigService, ALAIN_CONFIG } from '@delon/util';
import { NzConfig, NZ_CONFIG } from 'ng-zorro-antd/core/config';

const alainConfig: AlainConfig = {};

const alainModules = [AlainThemeModule.forRoot()];
const alainProvides = [{ provide: ALAIN_CONFIG, useValue: alainConfig }];

const ngZorroConfig: NzConfig = {
  table: {
    nzSize: 'middle',
  },
  button: {
    nzSize: 'small',
  },
};

const zorroProvides = [{ provide: NZ_CONFIG, useValue: ngZorroConfig }];

// #endregion

@NgModule({
  imports: [...alainModules],
})
export class GlobalConfigModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: GlobalConfigModule,
      providers: [...alainProvides, AlainConfigService, ...zorroProvides],
    };
  }
}
