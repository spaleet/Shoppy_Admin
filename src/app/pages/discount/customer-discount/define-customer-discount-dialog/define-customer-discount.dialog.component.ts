import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { DefineCustomerDiscountModel } from '@app_models/discount/customer-discount/define-customer-discount';
import { CkeditorService } from '@app_services/common/ckeditor/ckeditor.service';
import { CustomerDiscountService } from '@app_services/discount/customer-discount/customer-discount.service';
import { ToastrService } from 'ngx-toastr';
import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';

@Component({
  selector: 'app-define-customer-discount',
  templateUrl: './define-customer-discount.dialog.component.html'
})
export class DefineCustomerDiscountComponentDialog implements OnInit, AfterViewInit {

  defineForm: FormGroup;
  ckeditorTextValue = null;
  @ViewChild('startDatepickerInput') startDatepickerInput: ElementRef;
  @ViewChild('endDatepickerInput') endDatepickerInput: ElementRef;
  existsProductDiscount: boolean = false;
  @ViewChild('productIdInput') productIdInput: ElementRef;
  
  constructor(
    public dialogRef: MatDialogRef<DefineCustomerDiscountComponentDialog>,
    private customerDiscountService: CustomerDiscountService,
    private ckeditorService: CkeditorService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {

    this.ckeditorService.initCkeditor();

    this.defineForm = new FormGroup({
      productId: new FormControl(null, [Validators.required]),
      rate: new FormControl(null, [Validators.required])
    });
  }
  
  ngAfterViewInit() {

    fromEvent(this.productIdInput.nativeElement, 'keyup')
      .pipe(
        debounceTime(150),
        distinctUntilChanged(),
        tap(() => {
          this.checkProductHasCustomerDiscount();
        })
      )
      .subscribe();
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }

  submitDefineForm() {
    this.ckeditorTextValue = this.ckeditorService.getValue();
    
    if(!this.existsProductDiscount){
      
      if (this.defineForm.valid) {

        const defineData = new DefineCustomerDiscountModel(
          this.defineForm.controls.productId.value,
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
  
            this.onCloseClick();
  
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

  checkProductHasCustomerDiscount(){
    this.customerDiscountService.checkProductHasCustomerDiscount(this.defineForm.controls.productId.value).subscribe(res => {
      
      if(res.data.existsCustomerDiscount === true){
        this.toastr.info("برای این محصول یک تخفیف فعال وجود دارد", "اطلاعات");
        this.existsProductDiscount = true
      }

    });
  }
}
