import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {BehaviorSubject, Observable, throwError} from 'rxjs';
import {Injectable} from '@angular/core';
import {catchError, filter, switchMap, take} from 'rxjs/operators';
import {AuthService} from '../services/auth.service';
import {Router} from '@angular/router';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private authService: AuthService, private router: Router) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.authService.getLocalStorageAccessToken() && !request.url.includes('/oauth/token')) {
      request = this.getRequestCloneWithUpdatedAuthHeader(request, this.authService.getLocalStorageAccessToken());
    }

    return next.handle(request).pipe(catchError(error => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return this.handle401Error(request, next);
      } else {
        return throwError(error);
      }
    }));
  }

  private getRequestCloneWithUpdatedAuthHeader(request: HttpRequest<any>, token: string) {
    if (!token) {
      return request;
    }
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      return this.refreshTokenAndRetry(request, next);
    } else {
      return this.handlePendingRequest(request, next);
    }
  }

  private refreshTokenAndRetry(request: HttpRequest<any>, next: HttpHandler) {
    this.isRefreshing = true;
    this.refreshTokenSubject.next(null);
    return this.authService.refreshToken().pipe(
      switchMap((token: any) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(token.access_token);
          const clone = this.getRequestCloneWithUpdatedAuthHeader(request, token.access_token);
          return next.handle(clone);
        }
      ), catchError(() => {
        localStorage.clear();
        this.router.navigate(['/login']);
        return next.handle(request);
      })
    );
  }

  private handlePendingRequest(request: HttpRequest<any>, next: HttpHandler) {
    return this.refreshTokenSubject.pipe(
      filter(token => token != null),
      take(1),
      switchMap(jwt => {
        const requestWithUpdatedToken = this.getRequestCloneWithUpdatedAuthHeader(request, jwt);
        this.isRefreshing = false;
        return next.handle(requestWithUpdatedToken);
      }));
  }
}
