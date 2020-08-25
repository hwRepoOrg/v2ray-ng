import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PreventDefaultDirective } from './directives/prevent-default.directive';
import { JsonToObjectPipe } from './pipes/json-to-object.pipe';

@NgModule({
  declarations: [JsonToObjectPipe, PreventDefaultDirective],
  exports: [
    JsonToObjectPipe,
    PreventDefaultDirective,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
})
export class CommonsModule {}
