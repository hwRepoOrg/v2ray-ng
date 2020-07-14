import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonsModule } from '@renderer/commons/commons.module';
import { DelonABCModule } from '@renderer/delon-abc.module';
import { TitleComponent } from '@renderer/layouts/title/title.component';
import { NgZorroModule } from '@renderer/ng-zorro.module';
import { HomeComponent } from './home/home.component';
import { NodeConfigFormComponent } from './node-config-form/node-config-form.component';
import { NodeListComponent } from './node-list/node-list.component';
import { routes } from './pages.routing';

@NgModule({
  imports: [RouterModule.forRoot(routes), CommonsModule, NgZorroModule, DelonABCModule],
  exports: [RouterModule],
  declarations: [HomeComponent, NodeListComponent, TitleComponent, NodeConfigFormComponent],
})
export class PagesModule {}
