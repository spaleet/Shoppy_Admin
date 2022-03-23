import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IResponse } from '@app_models/_common/IResponse';
import { SliderModel, EditSliderModel, CreateSliderModel } from '@app_models/shop/slider/_index';
import { LoadingService } from '@loading';
import { environment } from '@environments/environment';
import { ToastrService } from 'ngx-toastr';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'platform'
})
export class SliderService {
  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private loading: LoadingService,
  ) { }

  getSlidersList(): Observable<IResponse<SliderModel[]>> {
    this.loading.loadingOn();

    return this.http.get<IResponse<SliderModel[]>>
      (`${environment.shopBaseApiUrl}/slider/get-list`)
      .pipe(
        tap(() => this.loading.loadingOff()),
        catchError((error: HttpErrorResponse) => {

          this.toastr.error(error.error.message, 'خطا', { timeOut: 2500 });
          this.loading.loadingOff();

          return throwError(error);
        })
      );
  }

  getSliderDetails(id: string): Observable<IResponse<EditSliderModel>> {
    this.loading.loadingOn();

    return this.http.get<IResponse<EditSliderModel>>
      (`${environment.shopBaseApiUrl}/slider/${id}`)
      .pipe(
        tap(() => this.loading.loadingOff()),
        catchError((error: HttpErrorResponse) => {

          this.toastr.error(error.error.message, 'خطا', { timeOut: 2500 });
          this.loading.loadingOff();

          return throwError(error);
        })
      );
  }

  createSlider(createData: CreateSliderModel): Observable<IResponse<any>> {

    this.loading.loadingOn();

    const formData = new FormData();

    formData.append('heading', createData.heading);
    formData.append('text', createData.text);
    formData.append('imageFile', createData.imageFile, createData.imageFile.name);
    formData.append('imageAlt', createData.imageAlt);
    formData.append('imageTitle', createData.imageTitle);
    formData.append('btnLink', createData.btnLink);
    formData.append('btnText', createData.btnText);

    return this.http.post<IResponse<any>>
      (`${environment.shopBaseApiUrl}/slider/create`, formData)
      .pipe(
        tap((res: IResponse<any>) => {

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

  editSlider(editData: EditSliderModel): Observable<IResponse<any>> {

    this.loading.loadingOn();

    const formData = new FormData();

    formData.append('id', editData.id);
    formData.append('heading', editData.heading);
    formData.append('text', editData.text);

    if (editData.imageFileUploaded) {
      formData.append('imageFile', editData.imageFile, editData.imageFile.name);
    }

    formData.append('imageAlt', editData.imageAlt);
    formData.append('imageTitle', editData.imageTitle);
    formData.append('btnLink', editData.btnLink);
    formData.append('btnText', editData.btnText);

    return this.http.put<IResponse<any>>
      (`${environment.shopBaseApiUrl}/slider/edit`, formData)
      .pipe(
        tap((res: IResponse<any>) => {

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

  removeSlider(sliderId: string): Observable<IResponse<any>> {
    return this.http.delete<IResponse<any>>
      (`${environment.shopBaseApiUrl}/slider/remove/${sliderId}`)
      .pipe(
        tap((res: IResponse<any>) => {

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

  restoreSlider(sliderId: string): Observable<IResponse<any>> {
    return this.http.delete<IResponse<any>>
      (`${environment.shopBaseApiUrl}/slider/restore/${sliderId}`)
      .pipe(
        tap((res: IResponse<any>) => {

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
}
