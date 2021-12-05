import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DefineCustomerDiscountModel } from '@app_models/discount/customer-discount/define-customer-discount';
import { CkeditorService } from '@app_services/common/ckeditor/ckeditor.service';
import { CustomerDiscountService } from '@app_services/discount/customer-discount/customer-discount.service';
import { ToastrService } from 'ngx-toastr';
import {Location} from '@angular/common';

@Component({
  selector: 'app-define-customer-discount',
  templateUrl: './define-customer-discount.component.html'
})
export class DefineCustomerDiscountComponent implements OnInit {

  defineForm: FormGroup;
  ckeditorTextValue = null;
  productId: number = 0;
  @ViewChild('startDatepickerInput') startDatepickerInput: ElementRef;
  @ViewChild('endDatepickerInput') endDatepickerInput: ElementRef;
  
  constructor(
    private customerDiscountService: CustomerDiscountService,
    private ckeditorService: CkeditorService,
    private activatedRoute: ActivatedRoute,
    private route: Router,
    private _location: Location,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {

    this.ckeditorService.initCkeditor();

    this.activatedRoute.params.subscribe(params => {
      this.productId = params.productId;

      if (this.productId === undefined) {
          this.route.navigate(['/customer-discount']);
      }
      
    });

    this.defineForm = new FormGroup({
      rate: new FormControl(null, [Validators.required])
    });
  }

  onCloseClick(): void {
    this._location.back();
  }

  submitDefineForm() {
    this.ckeditorTextValue = this.ckeditorService.getValue();
    
    if (this.defineForm.valid) {

      const defineData = new DefineCustomerDiscountModel(
        this.productId,
        this.defineForm.controls.rate.value,
        this.startDatepickerInput.nativeElement.value,
        this.endDatepickerInput.nativeElement.value,
        this.ckeditorService.getValue(),
      );

      this.customerDiscountService.defineCustomerDiscount(defineData).subscribe((res) => {
        if (res.status === 'success') {

          this.defineForm.reset();

          this.toastr.toastrConfig.tapToDismiss = false;
          this.toastr.toastrConfig.autoDismiss = true;
          this.toastr.toastrConfig.timeOut = 1500;

          this.toastr.success(res.message, 'موفقیت');

        }
      },
        (error) => {
          if (error instanceof HttpErrorResponse) {
            this.toastr.toastrConfig.tapToDismiss = false;
            this.toastr.toastrConfig.autoDismiss = true;
            this.toastr.toastrConfig.timeOut = 2500;

            this.toastr.error(error.error.message, 'خطا');
          }
        }
      );


    } else {
      this.defineForm.markAllAsTouched();
    }

  }
}