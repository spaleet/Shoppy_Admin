import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {IResponse} from '@app_models/_common/IResponse';
import {environment} from '@app_env';
import {tap, catchError, finalize} from 'rxjs/operators';
import {Observable, throwError} from 'rxjs';
import {ToastrService} from 'ngx-toastr';
import {LoadingService} from '@loading-service';
import {CreateArticleModel, EditArticleModel, FilterArticleModel} from '@app_models/blog/article/_index';

@Injectable({
  providedIn: 'platform'
})
export class ArticleService {
  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private loading: LoadingService
  ) { }

  filterArticle(filter: FilterArticleModel): Observable<FilterArticleModel> {

    this.loading.loadingOn();

    let params = new HttpParams();

    if (filter.title) {
      params = params.set('Title', filter.title)
    }

    return this.http.get<FilterArticleModel>(`${environment.blogBaseApiUrl}/article/filter`, {params})
      .pipe(
        finalize(() => this.loading.loadingOff()),
        catchError((error: HttpErrorResponse) => {
          this.toastr.error(error.error.message, 'خطا', {timeOut: 2500});
          return throwError(error);
        })
      );
  }

  getArticleDetails(id: string): Observable<EditArticleModel> {

    this.loading.loadingOn();

    return this.http.get<EditArticleModel>(`${environment.blogBaseApiUrl}/article/${id}`)
      .pipe(
        finalize(() => this.loading.loadingOff()),
        catchError((error: HttpErrorResponse) => {
          this.toastr.error(error.error.message, 'خطا', {timeOut: 2500});
          return throwError(error);
        })
      );
  }

  createArticle(createData: CreateArticleModel): Observable<IResponse> {

    this.loading.loadingOn();

    const formData = new FormData();

    formData.append('categoryId', createData.categoryId);
    formData.append('title', createData.title);
    formData.append('summary', createData.summary);
    formData.append('text', createData.text);
    formData.append('imageFile', createData.imageFile, createData.imageFile.name);
    formData.append('imageAlt', createData.imageAlt);
    formData.append('imageTitle', createData.imageTitle);
    formData.append('metaKeywords', createData.metaKeywords);
    formData.append('metaDescription', createData.metaDescription);
    formData.append('canonicalAddress', createData.canonicalAddress);

    return this.http.post<IResponse>(`${environment.blogBaseApiUrl}/article/create`, formData)
      .pipe(
        finalize(() => this.loading.loadingOff()),
        tap((res: IResponse) => this.toastr.success(res.message, 'موفقیت', {timeOut: 1500})),
        catchError((error: HttpErrorResponse) => {
          this.toastr.error(error.error.message, 'خطا', {timeOut: 2500});
          return throwError(error);
        })
      );
  }

  editArticle(editData: EditArticleModel): Observable<IResponse> {

    this.loading.loadingOn();

    const formData = new FormData();

    formData.append('id', editData.id);
    formData.append('title', editData.title);
    formData.append('summary', editData.summary);
    formData.append('text', editData.text);
    formData.append('categoryId', editData.categoryId);

    if (editData.imageFileUploaded) {
      formData.append('imageFile', editData.imageFile, editData.imageFile.name);
    }

    formData.append('imageAlt', editData.imageAlt);
    formData.append('imageTitle', editData.imageTitle);
    formData.append('metaKeywords', editData.metaKeywords);
    formData.append('metaDescription', editData.metaDescription);
    formData.append('canonicalAddress', editData.canonicalAddress);

    return this.http.put<IResponse>(`${environment.blogBaseApiUrl}/article/edit`, formData)
      .pipe(
        finalize(() => this.loading.loadingOff()),
        tap((res: IResponse) => this.toastr.success(res.message, 'موفقیت', {timeOut: 1500})),
        catchError((error: HttpErrorResponse) => {
          this.toastr.error(error.error.message, 'خطا', {timeOut: 2500});
          return throwError(error);
        })
      );
  }

  deleteArticle(articleId: string): Observable<IResponse> {
    this.loading.loadingOn();

    return this.http.delete<IResponse>(`${environment.blogBaseApiUrl}/article/delete/${articleId}`)
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
