﻿import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  CanLoad,
  Data,
  Route,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
import { AuthService } from "@app_services/auth/auth.service";
import { AuthGuardPermission } from '../_models/auth/auth-guard-permission';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {

  private permissionObjectKey = "permission";

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const permissionData = route.data[this.permissionObjectKey] as AuthGuardPermission;
    console.log('guard ', permissionData);
    
    const returnUrl = state.url;
    return this.hasAuthUserAccessToThisRoute(permissionData, returnUrl);
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const permissionData = childRoute.data[this.permissionObjectKey] as AuthGuardPermission;
    const returnUrl = state.url;
    return this.hasAuthUserAccessToThisRoute(permissionData, returnUrl);
  }

  canLoad(route: Route): boolean {
    if (route.data) {
      const permissionData = route.data[this.permissionObjectKey] as AuthGuardPermission;
      const returnUrl = `/${route.path}`;
      return this.hasAuthUserAccessToThisRoute(permissionData, returnUrl);
    } else {
      return true;
    }
  }

  private hasAuthUserAccessToThisRoute(permissionData: Data, returnUrl: string): boolean {
    console.log('guard is login ', this.authService.isAuthUserLoggedIn());

    if (!this.authService.isAuthUserLoggedIn()) {
      this.showAccessDenied(returnUrl);
      return false;
    }

    if (!permissionData) {
      return true;
    }

    if (Array.isArray(permissionData.deniedRoles) && Array.isArray(permissionData.permittedRoles)) {
      throw new Error("Don't set both 'deniedRoles' and 'permittedRoles' in route data.");
    }

    if (Array.isArray(permissionData.permittedRoles)) {
      const isInRole = this.authService.isAuthUserInRoles(permissionData.permittedRoles);
      console.log('guard isInRole ', isInRole);

      if (isInRole) {
        return true;
      }

      this.showAccessDenied(returnUrl);
      return false;
    }

    if (Array.isArray(permissionData.deniedRoles)) {
      const isInRole = this.authService.isAuthUserInRoles(permissionData.deniedRoles);
      if (!isInRole) {
        return true;
      }

      this.showAccessDenied(returnUrl);
      return false;
    }

    return true;
  }

  private showAccessDenied(returnUrl: string) {
    this.router.navigate(["/auth/access-denied"], { queryParams: { returnUrl: returnUrl } });
  }
}
