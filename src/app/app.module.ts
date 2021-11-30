import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { ProductCategoryService } from '@app_services/shop/product-category/product-category.service';
import { IndexModule } from '@apppages/index/index.module';
import { ComponentsModule } from '@app_components/components.module';
import { ProductCategoryModule } from '@apppages/product-category/product.category.module';
import { CkeditorService } from '@app_services/common/ckeditor/ckeditor.service';
import { ProductModule } from '@apppages/product/product.module';
import { SliderService } from '@app_services/shop/slider/slider.service';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ComponentsModule,
    IndexModule,
    ProductCategoryModule,
    ProductModule
  ],
  providers: [
    ProductCategoryService,
    CkeditorService,
    SliderService
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
