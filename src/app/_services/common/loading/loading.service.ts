import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable()
export class LoadingService {

  private loadingSubject:BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  loading$: Observable<boolean> = this.loadingSubject.asObservable();

  showLoaderUntilCompleted<T>(obs: Observable<T>): Observable<T>{
    return undefined;
  }

  loadingOn(){
    this.loadingSubject.next(true);
  }

  
  loadingOff(){
    this.loadingSubject.next(false);
  }

  
}