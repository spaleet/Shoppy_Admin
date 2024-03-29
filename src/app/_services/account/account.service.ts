import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable, throwError} from 'rxjs';
import {environment} from '@app_env';
import {ToastrService} from 'ngx-toastr';
import {LoadingService} from '@loading-service';
import {catchError, finalize} from 'rxjs/operators';
import {FilterAccountModel} from '@app_models/account/filter-account';

@Injectable({
  providedIn: 'platform'
})
export class AccountService {
  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private loading: LoadingService
  ) { }


  filterAccount(filter: FilterAccountModel): Observable<FilterAccountModel> {

    this.loading.loadingOn();

    let params = new HttpParams();

    if (filter.fullName) {
      params = params.set('FullName', filter.fullName);
    }
    if (filter.email) {
      params = params.set('Email', filter.email);
    }

    return this.http.get<FilterAccountModel>(`${environment.accountBaseApiUrl}/filter`, {params})
      .pipe(
        finalize(() => this.loading.loadingOff()),
        catchError((error: HttpErrorResponse) => {
          this.toastr.error(error.error.message, 'خطا', {timeOut: 2500});
          return throwError(error);
        })
      );
  }

}
