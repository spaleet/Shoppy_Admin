/* eslint-disable @typescript-eslint/no-explicit-any */
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {Router} from "@angular/router";
import {AuthTokenType} from "@app_models/auth/auth-token-type";
import {TokenStoreService, RefreshTokenService} from "@app_services/auth/_index";
import {ToastrService} from "ngx-toastr";
import {switchMap, take, filter, catchError} from "rxjs/operators";
import {BehaviorSubject, Observable, throwError} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {

  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private toastr: ToastrService,
    private tokenStoreService: TokenStoreService,
    private refreshTokenService: RefreshTokenService,
    private router: Router) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (request.url.includes("refresh-token")) {
      return next.handle(request)
    }

    const accessToken = this.tokenStoreService.getRawAuthToken(AuthTokenType.AccessToken);

    if (!accessToken) {
      const refreshToken = this.tokenStoreService.getRawAuthToken(AuthTokenType.RefreshToken);

      if (!refreshToken){
        return next.handle(request);
      } else {
        return this.handle401Error(request, next);
      }
    } else {
      request = this.addToken(request, accessToken);

      return next.handle(request)
        .pipe(
          catchError(error => {

            if (error instanceof HttpErrorResponse) {

              switch (error.status) {
                case 401:
                case 403:
                case 0:
                  return this.handle401Error(request, next);

                case 400:
                  return throwError(error);

                case 404:
                case 500:
                  this.router.navigate(["/not-found"]);
                  return throwError(error);

                default:
                  return throwError(error);
              }

            }

            return throwError(error);
          }));
    }
  }


  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);
      const oldToken = this.tokenStoreService.getRawAuthToken(AuthTokenType.RefreshToken);
      return this.refreshTokenService.revokeRefreshTokenRequestModel(oldToken)
        .pipe(
          switchMap(res => {
            this.isRefreshing = false;
            this.refreshTokenSubject.next(res.accessToken);
            return next.handle(this.addToken(request, res.accessToken));
          }),
          catchError((error) => {
            this.router.navigate(["/auth/access-denied"]);
            return throwError(error);
          })
        );

    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(jwt => {
          return next.handle(this.addToken(request, jwt));
        }));
    }
  }

  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        'Authorization': `Bearer ${token.toString()}`
      }
    });
  }

}
