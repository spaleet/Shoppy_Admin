﻿import {Injectable} from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree
} from "@angular/router";
import {AuthTokenType} from "@app_models/auth/_index";
import {AuthService, TokenStoreService, RefreshTokenService} from "@app_services/auth/_index";
import {BehaviorSubject, Observable} from "rxjs";
import {filter, take, tap} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  private isRefreshing = false;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  private returnUrl: string = '/';

  constructor(private authService: AuthService,
    private tokenStoreService: TokenStoreService,
    private refreshTokenService: RefreshTokenService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    this.returnUrl = state.url;

    const accessToken = this.tokenStoreService.getRawAuthToken(AuthTokenType.AccessToken);
    if (!accessToken) {
      const refreshToken = this.tokenStoreService.getRawAuthToken(AuthTokenType.RefreshToken);

      if (!refreshToken) {
        this.showAccessDenied();
        return false;
      } else {
        return this.checkRefreshToken()
      }
    } else {
      return this.checkIsLoggedIn();
    }
  }

  private checkIsLoggedIn(): Promise<boolean> {
    return this.authService.isAuthUserLoggedIn()
      .toPromise()
      .then(res => {
        if (res) {
          return true
        } else {
          this.showAccessDenied();
          return false;
        }
      }).catch(() => {
        this.showAccessDenied();
        return false;
      })
  }

  private checkRefreshToken(): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);
      const oldToken = this.tokenStoreService.getRawAuthToken(AuthTokenType.RefreshToken);
      return this.refreshTokenService.revokeRefreshTokenRequestModel(oldToken)
        .toPromise()
        .then(res => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(res.accessToken);
          return this.checkIsLoggedIn();
        }).catch(() => {
          this.router.navigate(["/auth/access-denied"]);
          return false;
        })

    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        tap(() => {
          return this.checkIsLoggedIn();
        }));
    }
  }

  private showAccessDenied(): void {
    this.router.navigate(["/auth/access-denied"], {queryParams: {returnUrl: this.returnUrl}});
  }
}
