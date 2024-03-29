/* eslint-disable @typescript-eslint/no-explicit-any */
import {Component, AfterViewInit, ElementRef, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {debounceTime, distinctUntilChanged, tap} from 'rxjs/operators';
import {fromEvent} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {Title} from '@angular/platform-browser';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {PagingDataSortCreationDateOrder, PagingDataSortIdOrder} from '@app_models/_common/_index';
import {OrderDataServer, FilterOrderModel, FilterOrderPaymentStatus} from '@app_models/order/_index';
import {OrderModel} from '@app_models/order/order';
import {OrderService} from '@app_services/order/order.service';
import {OrderItemsPage} from '../order-items/order-items.page';

@Component({
  selector: 'app-filter-orders',
  templateUrl: './filter-order.page.html'
})
export class FilterOrderPage implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild('filterUserNameInput') filterUserNameInput: ElementRef;

  displayedColumns: string[] = ['user', 'state', 'amount', 'issueTrackingNo', 'creationDate', 'commands'];
  paymentState: FilterOrderPaymentStatus = FilterOrderPaymentStatus.All;
  dataServer: OrderDataServer;
  dataSource: MatTableDataSource<OrderModel> = new MatTableDataSource<OrderModel>([]);
  isDataSourceLoaded = false;
  filterOrder: FilterOrderModel = new FilterOrderModel("", this.paymentState, 1, 25, PagingDataSortCreationDateOrder.DES, PagingDataSortIdOrder.NotSelected);

  constructor(
    private pageTitle: Title,
    public dialog: MatDialog,
    private orderService: OrderService
  ) {
    this.pageTitle.setTitle('مدیریت سفارشات');
  }

  ngOnInit(): void {
    this.dataServer = new OrderDataServer(this.orderService);
    this.dataServer.load(this.filterOrder);
    this.dataSource = new MatTableDataSource<OrderModel>(this.dataServer.data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    if (this.dataSource.data.length === 0) {
      this.isDataSourceLoaded = false;
    }
  }

  ngAfterViewInit(): void {

    setInterval(() => {
      if (this.isDataSourceLoaded === false) {
        this.dataSource = new MatTableDataSource<OrderModel>(this.dataServer.data);
        this.dataSource.sort = this.sort;
        this.paginator.pageIndex = (this.dataServer.pageId - 1);
        this.paginator.length = this.dataServer.resultsLength;
        this.paginator.pageSize = this.filterOrder.takePage;

        if (this.dataSource.data.length !== 0) {
          this.isDataSourceLoaded = true;
        } else {
          this.isDataSourceLoaded = false;
        }
      }

    }, 1000)

    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    this.sort.sortChange
      .pipe(
        tap(change => {

          if (change.active === 'id') {

            if (change.direction === 'asc') {
              this.filterOrder.sortIdOrder = PagingDataSortIdOrder.ASC;
            } else {
              this.filterOrder.sortIdOrder = PagingDataSortIdOrder.DES;
            }
          }

          if (change.active === 'creationDate') {

            if (change.direction === 'asc') {
              this.filterOrder.sortCreationDateOrder = PagingDataSortCreationDateOrder.ASC;
            } else {
              this.filterOrder.sortCreationDateOrder = PagingDataSortCreationDateOrder.DES;
            }
          }

          this.load()
        })
      )
      .subscribe();


    fromEvent(this.filterUserNameInput.nativeElement, 'keyup')
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => {
          this.paginator.pageIndex = 0;
          this.load();
        })
      )
      .subscribe();
  }

  onPaginateChange(event: PageEvent): void {
    let page = event.pageIndex;
    const size = event.pageSize;

    page = page + 1;

    if (this.filterOrder.takePage !== size) {
      page = 1;
    }
    const sortDate: PagingDataSortCreationDateOrder = this.filterOrder.sortCreationDateOrder;
    const sortId: PagingDataSortIdOrder = this.filterOrder.sortIdOrder;

    this.filterOrder = new FilterOrderModel(
      this.filterUserNameInput.nativeElement.value,
      this.paymentState,
      page,
      size,
      sortDate,
      sortId
    );
    this.ngOnInit();
    this.paginator.pageSize = size;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  setPayment(event: any): void {
    this.paymentState = FilterOrderPaymentStatus[event.value];
    this.load();
  }

  load(): void {

    const sortDate: PagingDataSortCreationDateOrder = this.filterOrder.sortCreationDateOrder;
    const sortId: PagingDataSortIdOrder = this.filterOrder.sortIdOrder;

    this.filterOrder = new FilterOrderModel(
      this.filterUserNameInput.nativeElement.value,
      this.paymentState,
      (this.paginator.pageIndex + 1),
      this.paginator.pageSize,
      sortDate,
      sortId
    );

    this.ngOnInit();
    this.paginator.length = this.dataServer.resultsLength;
    this.paginator.pageSize = this.filterOrder.takePage;
  }

  openItemsDialog(id: string): void {
    this.dialog.open(OrderItemsPage, {
      width: '950px',
      height: '800px',
      data: {
        id: id
      }
    });
  }
}
