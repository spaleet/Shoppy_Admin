import { Component, AfterViewInit, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { fromEvent } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Title } from '@angular/platform-browser';
import { CustomerDiscountService } from '@app_services/discount/customer-discount/customer-discount.service';
import { FilterCustomerDiscountModel } from '@app_models/discount/customer-discount/_index';
import { CustomerDiscountDataSource } from '@app_models/discount/customer-discount/customer-discount-data-source';
import { DefineCustomerDiscountDialog } from '../define-customer-discount-dialog/define-customer-discount.dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { EditCustomerDiscountDialog } from '../edit-customer-discount-dialog/edit-customer-discount.dialog';

@Component({
  selector: 'app-filter-customer-discount',
  templateUrl: './filter-customer-discount.page.html'
})
export class FilterCustomerDiscountPage implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('filterProductIdInput') filterProductIdInput: ElementRef;
  @ViewChild('filterProductTitleInput') filterProductTitleInput: ElementRef;
  displayedColumns: string[] = ['id', 'product', 'description', 'rate', 'startDate',
    'endDate', 'state', 'commands'];
  dataSource: CustomerDiscountDataSource;
  filterCustomerDiscounts: FilterCustomerDiscountModel = new FilterCustomerDiscountModel(0, '', []);

  constructor(
    private pageTitle: Title,
    public dialog: MatDialog,
    private customerDiscountService: CustomerDiscountService,
    private toastr: ToastrService
  ) {
    this.pageTitle.setTitle('مدیریت تخفیفات محصولات');
  }

  ngOnInit(): void {
    this.dataSource = new CustomerDiscountDataSource(this.customerDiscountService);
    this.dataSource.loadCustomerDiscounts(this.filterCustomerDiscounts);
  }

  ngAfterViewInit() {

    fromEvent(this.filterProductIdInput.nativeElement, 'keyup')
      .pipe(
        debounceTime(150),
        distinctUntilChanged(),
        tap(() => {
          this.paginator.pageIndex = 0;
          this.loadCustomerDiscountsPage();
        })
      )
      .subscribe();

    fromEvent(this.filterProductTitleInput.nativeElement, 'keyup')
      .pipe(
        debounceTime(150),
        distinctUntilChanged(),
        tap(() => {
          this.paginator.pageIndex = 0;
          this.loadCustomerDiscountsPage();
        })
      )
      .subscribe();

    this.paginator.page
      .pipe(
        tap(() => this.loadCustomerDiscountsPage())
      )
      .subscribe();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(DefineCustomerDiscountDialog, {
      width: '600px',
      height: '700px'
    }).afterClosed().subscribe(() => {
      this.ngOnInit();
    });
  }

  openEditDialog(id: number): void {
    const dialogRef = this.dialog.open(EditCustomerDiscountDialog, {
      width: '600px',
      height: '700px',
      data: {
        id: id
      }
    }).afterClosed().subscribe(() => {
      this.ngOnInit();
    });
  }

  loadCustomerDiscountsPage() {
    this.filterCustomerDiscounts = new FilterCustomerDiscountModel(this.filterProductIdInput.nativeElement.value,
      this.filterProductTitleInput.nativeElement.value, []);
    this.dataSource.loadCustomerDiscounts(this.filterCustomerDiscounts);
  }

  deleteCustomerDiscount(id: number) {
    this.customerDiscountService.deleteCustomerDiscount(id).subscribe((res) => {

      if (res.status === 'success') {
        this.ngOnInit();
        this.toastr.success(res.message, 'موفقیت', { timeOut: 1500 });
      }

    },
      (error) => {
        if (error instanceof HttpErrorResponse) {
          
          this.toastr.error(error.error.message, 'خطا', { timeOut: 2500 });

        }
      }
    );
  }

}