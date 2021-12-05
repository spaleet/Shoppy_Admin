import { Component, AfterViewInit, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ProductCategoryService } from '@app_services/shop/product-category/product-category.service';
import { MatPaginator } from '@angular/material/paginator';
import { ProductCategoryDataSource, FilterProductCategoryModel } from '@app_models/shop/product-category/_index';
import { debounceTime, distinctUntilChanged, tap } from 'rxjs/operators';
import { fromEvent } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { CreateProductCategoryComponent } from '../create-product-category/create-product-category.component';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { EditProductCategoryComponent } from '../edit-product-category/edit-product-category.component';
import { environment } from '@environments/environment';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-filter-product-category',
  templateUrl: './filter-product-category.component.html'
})
export class FilterProductCategoryComponent implements OnInit, AfterViewInit {

  //#region properties

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('filterInput') input: ElementRef;
  displayedColumns: string[] = ['id', 'thumbnailImage', 'title', 'creationDate', 'productsCount', 'commands'];
  dataSource: ProductCategoryDataSource;
  thumbnailBasePath: string = `${environment.productCategoryBaseImagePath}/thumbnail/`;
  filterProductCategories: FilterProductCategoryModel = new FilterProductCategoryModel('', []);

  //#endregion

  //#region Ctor

  constructor(
    private pageTitle: Title,
    public dialog: MatDialog,
    private productCategoryService: ProductCategoryService,
    private toastr: ToastrService
  ) { 
    this.pageTitle.setTitle('مدیریت دسته بندی محصولات');
  }

  //#endregion

  //#region ngOnInit

  ngOnInit(): void {
    this.dataSource = new ProductCategoryDataSource(this.productCategoryService);
    this.dataSource.loadProductCategories(this.filterProductCategories);
  }

  //#endregion

  //#region ngAfterViewInit

  ngAfterViewInit() {

    fromEvent(this.input.nativeElement, 'keyup')
      .pipe(
        debounceTime(150),
        distinctUntilChanged(),
        tap(() => {
          this.paginator.pageIndex = 0;
          this.loadProductCategoriesPage();
        })
      )
      .subscribe();

    this.paginator.page
      .pipe(
        tap(() => this.loadProductCategoriesPage())
      )
      .subscribe();
  }

  //#endregion

  //#region openCreateDialog

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CreateProductCategoryComponent, {
      width: '600px',
      height: '700px'
    }).afterClosed().subscribe(() => {
      this.ngOnInit();
    });
  }

  //#endregion

  //#region openEditDialog

  openEditDialog(id:number): void {
    const dialogRef = this.dialog.open(EditProductCategoryComponent, {
      width: '600px',
      height: '700px',
      data: {
        id: id
      }
    }).afterClosed().subscribe(() => {
      this.ngOnInit();
    });
  }

  //#endregion

  //#region loadProductCategoriesPage

  loadProductCategoriesPage() {
    this.filterProductCategories = new FilterProductCategoryModel(this.input.nativeElement.value, []);
    this.dataSource.loadProductCategories(this.filterProductCategories);
  }

  //#endregion

  //#region deleteProductCategory

  deleteProductCategory(id: number) {
    this.productCategoryService.deleteProductCategory(id).subscribe((res) => {
      if (res.status === 'success') {


        this.ngOnInit();

        this.toastr.toastrConfig.tapToDismiss = false;
        this.toastr.toastrConfig.autoDismiss = true;
        this.toastr.toastrConfig.timeOut = 1500;

        this.toastr.success('دسته بندی مورد نظر با موفقیت حذف شد', 'موفقیت');
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
  }

  //#endregion
}