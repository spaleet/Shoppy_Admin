import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {DefineProductDiscountModel} from '@app_models/discount/product-discount/define-product-discount';
import {CkeditorService} from '@app_services/_common/ckeditor/ckeditor.service';
import {ProductDiscountService} from '@app_services/discount/product-discount/product-discount.service';
import {Location} from '@angular/common';
import {Title} from '@angular/platform-browser';
import {LoadingService} from '@loading-service';
import {checkFormGroupErrors} from '@app_services/_common/functions/functions';

@Component({
  selector: 'app-define-product-discount',
  templateUrl: './define-product-discount.page.html'
})
export class DefineProductDiscountPage implements OnInit {

  defineForm: FormGroup;
  ckeditorTextValue = null;
  productId = "";
  @ViewChild('startDatepickerInput') startDatepickerInput: ElementRef;
  @ViewChild('endDatepickerInput') endDatepickerInput: ElementRef;

  constructor(
    private ProductDiscountService: ProductDiscountService,
    private ckeditorService: CkeditorService,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private pageTitle: Title,
    private _location: Location,
    private loading: LoadingService
  ) {
    this.pageTitle.setTitle('تعریف تخفیف محصول');
  }

  ngOnInit(): void {
    this.loading.loadingOn();

    this.ckeditorService.initCkeditor();

    this.activatedRoute.params.subscribe(params => {
      this.productId = params.productId;

      if (this.productId === undefined) {
          this.route.navigate(['/product-discount']);
      }

      this.ProductDiscountService.checkProductHasProductDiscount(this.productId).subscribe(res => {
        if (res.existsProductDiscount === true){
          this.onCloseClick();
        }
      });

    });

    this.defineForm = new FormGroup({
      rate: new FormControl(null, [Validators.required, Validators.min(1), Validators.max(100)])
    });
  }

  checkError(controlName: string, errorName: string): boolean {
    return checkFormGroupErrors(this.defineForm, controlName, errorName)
  }

  onCloseClick(): void {
    this.loading.loadingOff();
    this._location.back();
  }

  submit(): void {
    this.loading.loadingOn();

    this.ckeditorTextValue = this.ckeditorService.getValue();

    if (this.defineForm.valid) {

      const defineData = new DefineProductDiscountModel(
        this.productId,
        this.defineForm.controls.rate.value,
        this.startDatepickerInput.nativeElement.value,
        this.endDatepickerInput.nativeElement.value,
        this.ckeditorService.getValue()
      );

      this.ProductDiscountService.defineProductDiscount(defineData).subscribe((res) => {
        if (res.status === 200) {
          this.defineForm.reset();
        }
      });


    } else {
      this.defineForm.markAllAsTouched();
    }

    this.loading.loadingOff();

  }
}
