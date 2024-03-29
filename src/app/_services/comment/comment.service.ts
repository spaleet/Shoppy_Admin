import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {IResponse} from '@app_models/_common/IResponse';
import {environment} from '@app_env';
import {tap, catchError, finalize} from 'rxjs/operators';
import {Observable, throwError} from 'rxjs';
import {ToastrService} from 'ngx-toastr';
import {LoadingService} from '@loading-service';
import {FilterCommentModel} from '@app_models/comment/_index';

@Injectable({
  providedIn: 'platform'
})
export class CommentService {
  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private loading: LoadingService
  ) { }

  filterComment(filter: FilterCommentModel): Observable<FilterCommentModel> {

    this.loading.loadingOn()

    const params = new HttpParams()
      .set('State', filter.state)
      .set('Type', filter.type);

    return this.http.get<FilterCommentModel>(`${environment.commentBaseApiUrl}/filter`, {params})
      .pipe(
        finalize(() => this.loading.loadingOff()),
        catchError((error: HttpErrorResponse) => {
          this.toastr.error(error.error.message, 'خطا', {timeOut: 2500});
          return throwError(error);
        })
      );
  }

  confirmComment(commentId: string): Observable<IResponse> {
    this.loading.loadingOn();

    return this.http.post<IResponse>(`${environment.commentBaseApiUrl}/confirm/${commentId}`, null!)
      .pipe(
        finalize(() => this.loading.loadingOff()),
        tap((res: IResponse) => this.toastr.success(res.message, 'موفقیت', {timeOut: 1500})),
        catchError((error: HttpErrorResponse) => {
          this.toastr.error(error.error.message, 'خطا', {timeOut: 2500});
          return throwError(error);
        })
      );
  }

  cancelComment(commentId: string): Observable<IResponse> {
    this.loading.loadingOn();

    return this.http.post<IResponse>(`${environment.commentBaseApiUrl}/cancel/${commentId}`, null!)
      .pipe(
        finalize(() => this.loading.loadingOff()),
        tap((res: IResponse) => this.toastr.success(res.message, 'موفقیت', {timeOut: 1500})),
        catchError((error: HttpErrorResponse) => {
          this.toastr.error(error.error.message, 'خطا', {timeOut: 2500});
          return throwError(error);
        })
      );
  }

}
