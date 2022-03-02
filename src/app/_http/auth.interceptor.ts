import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { AuthTokenType } from "@app_models/auth/auth-token-type";
import { RefreshTokenService } from "@app_services/auth/refresh-token.service";
import { TokenStoreService } from "@app_services/auth/token-store.service";
import { Observable, of, throwError } from "rxjs";
import { catchError, delay, mergeMap, retryWhen, take } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {

  private delayBetweenRetriesMs = 1000;
  private numberOfRetries = 3;

  constructor(
    private tokenStoreService: TokenStoreService,
    private refreshTokenService: RefreshTokenService,
    private router: Router) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const accessToken = this.tokenStoreService.getRawAuthToken(AuthTokenType.AccessToken);
    
    if (accessToken !== '') {
      request = request.clone({
        headers: request.headers.append('Authorization', 'Bearer ' + accessToken)
      });
      return next.handle(request)
      .pipe(
        retryWhen(errors => errors.pipe(
          mergeMap((error: HttpErrorResponse, retryAttempt: number) => {
            if (retryAttempt === this.numberOfRetries - 1) {
              console.log(`HTTP call '${request.method} ${request.url}' failed after ${this.numberOfRetries} retries.`);
              return throwError(error); // no retry
            }

            switch (error.status) {
              case 400:
              case 404:
                return throwError(error); // no retry
            }

            return of(error); // retry
          }),
          delay(this.delayBetweenRetriesMs),
          take(this.numberOfRetries)
        )),
        catchError((error: HttpErrorResponse, caught: Observable<HttpEvent<any>>) => {
          console.error({ error, caught });
          if (error.status === 401 || error.status === 403) {
            const newRequest = this.getNewAuthRequest(request);
            if (newRequest) {
              console.log("Try new AuthRequest ...");
              return next.handle(newRequest);
            }
            this.router.navigate(["/auth/access-denied"]);
          }
          return throwError(error);
        })
      );
    } else {
      // login page
      return next.handle(request);
    }
  }

  getNewAuthRequest(request: HttpRequest<any>): HttpRequest<any> | null {
    const oldAccessToken = this.tokenStoreService.getRawAuthToken(AuthTokenType.AccessToken);
    if (oldAccessToken !== '') {
      this.refreshTokenService.revokeRefreshTokenRequestModel(oldAccessToken)
      .subscribe(res => {    
        console.log('int new req auth');
        
        if(res.status !== 'success'){
          return request.clone({ headers: request.headers.set('Authorization', 'Bearer ' + res.data.accessToken) });
        }   
        return request;
      })
    } 
    return request;
  }
}
