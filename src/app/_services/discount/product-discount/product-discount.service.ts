import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { IResponse } from '@app_models/_common/IResponse';
import { environment } from '@app_env';
import { CheckProductHasProductDiscountResponseModel, DefineProductDiscountModel, EditProductDiscountModel, FilterProductDiscountModel } from '@app_models/discount/product-discount/_index';
import { ToastrService } from 'ngx-toastr';
import { LoadingService } from '@loading-service';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'platform'
})
export class ProductDiscountService {
  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private loading: LoadingService,
  ) { }


  filterProductDiscount(filter: FilterProductDiscountModel): Observable<FilterProductDiscountModel> {
    this.loading.loadingOn();

    let params = new HttpParams();

    if (filter.productTitle) {
      params = params.set('productTitle', filter.productTitle);
    }
    if (filter.productId) {
      params = params.set('productId', filter.productId.toString())
    }

    return this.http.get<FilterProductDiscountModel>
      (`${environment.discountBaseApiUrl}/product-discount/filter`, { params })
      .pipe(
        tap(() => this.loading.loadingOff()),
        catchError((error: HttpErrorResponse) => {

          this.toastr.error(error.error.message, 'خطا', { timeOut: 2500 });
          this.loading.loadingOff();

          return throwError(error);
        })
      );
  }

  getProductDiscountDetails(id: string): Observable<EditProductDiscountModel> {
    this.loading.loadingOn();

    return this.http.get<EditProductDiscountModel>
      (`${environment.discountBaseApiUrl}/product-discount/${id}`)
      .pipe(
        tap(() => this.loading.loadingOff()),
        catchError((error: HttpErrorResponse) => {

          this.toastr.error(error.error.message, 'خطا', { timeOut: 2500 });
          this.loading.loadingOff();

          return throwError(error);
        })
      );
  }

  defineProductDiscount(createData: DefineProductDiscountModel): Observable<IResponse> {

    this.loading.loadingOn();

    const formData = new FormData();

    formData.append('rate', createData.rate.toString());
    formData.append('productId', createData.productId.toString());
    formData.append('startDate', createData.startDate);
    formData.append('endDate', createData.endDate);
    formData.append('description', createData.description);

    return this.http.post<IResponse>
      (`${environment.discountBaseApiUrl}/product-discount/define`, formData)
      .pipe(
        tap((res: IResponse) => {

          this.toastr.success(res.message, 'موفقیت', { timeOut: 1500 });
          this.loading.loadingOff();

        }),
        catchError((error: HttpErrorResponse) => {

          this.toastr.error(error.error.message, 'خطا', { timeOut: 2500 });
          this.loading.loadingOff();

          return throwError(error);
        })
      );
  }

  editProductDiscount(editData: EditProductDiscountModel): Observable<IResponse> {
    this.loading.loadingOn();

    const formData = new FormData();

    formData.append('id', editData.id.toString());
    formData.append('productId', editData.productId.toString());
    formData.append('rate', editData.rate.toString());
    formData.append('startDate', editData.startDate);
    formData.append('endDate', editData.endDate);
    formData.append('description', editData.description);

    return this.http.put<IResponse>
      (`${environment.discountBaseApiUrl}/product-discount/edit`, formData)
      .pipe(
        tap((res: IResponse) => {

          this.toastr.success(res.message, 'موفقیت', { timeOut: 1500 });
          this.loading.loadingOff();

        }),
        catchError((error: HttpErrorResponse) => {

          this.toastr.error(error.error.message, 'خطا', { timeOut: 2500 });
          this.loading.loadingOff();

          return throwError(error);
        })
      );
  }

  deleteProductDiscount(ProductDiscountId: string): Observable<IResponse> {
    this.loading.loadingOn();

    return this.http.delete<IResponse>
      (`${environment.discountBaseApiUrl}/product-discount/remove/${ProductDiscountId}`)
      .pipe(
        tap((res: IResponse) => {

          this.toastr.success(res.message, 'موفقیت', { timeOut: 1500 });
          this.loading.loadingOff();

        }),
        catchError((error: HttpErrorResponse) => {

          this.toastr.error(error.error.message, 'خطا', { timeOut: 2500 });
          this.loading.loadingOff();

          return throwError(error);
        })
      );
  }

  checkProductHasProductDiscount(productId: string)
    : Observable<CheckProductHasProductDiscountResponseModel> {
    this.loading.loadingOn();

    return this.http.get<CheckProductHasProductDiscountResponseModel>
      (`${environment.discountBaseApiUrl}/product-discount/has-discount/${productId}`)
      .pipe(
        tap((res: CheckProductHasProductDiscountResponseModel) => {
          if (res.existsProductDiscount) {
            this.toastr.info("برای این محصول یک تخفیف فعال وجود دارد", "اطلاعات", { timeOut: 2500 });
          }
          this.loading.loadingOff()
        }),
        catchError((error: HttpErrorResponse) => {

          this.toastr.error(error.error.message, 'خطا', { timeOut: 2500 });
          this.loading.loadingOff();

          return throwError(error);
        })
      );
  }

}
