import {Router} from '@angular/router';
import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import LoginInfo from '../models/login-info';
import User from '../models/user';
import Tokens from '../models/session-info';
import {tap} from 'rxjs/operators';
import {environment} from '../../environments/environment';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  public sessionInfo: User;
  public loginAttemptFailed = false;
  public refreshTokenExpirationTime;
  public refreshTokenExpirationInterval;
  private readonly JWT_TOKEN = 'JWT_TOKEN';
  private readonly REFRESH_TOKEN_EXPIRATION = 'REFRESH_TOKEN_EXPIRATION';
  private readonly REFRESH_TOKEN = 'REFRESH_TOKEN';

  constructor(private http: HttpClient, private router: Router) {
  }

  getLocalStorageAccessToken() {
    return localStorage.getItem(this.JWT_TOKEN);
  }

  getLocalStorageRefreshToken() {
    return localStorage.getItem(this.REFRESH_TOKEN);
  }

  private storeTokens(tokens: Tokens) {
    localStorage.removeItem(this.JWT_TOKEN);
    localStorage.removeItem(this.JWT_TOKEN);
    localStorage.setItem(this.JWT_TOKEN, tokens.access_token);
    localStorage.setItem(this.REFRESH_TOKEN, tokens.refresh_token);
  }

  private getAuthHeaders() {
    return new HttpHeaders()
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .set('Authorization', 'Basic ' + btoa(`${environment.clientId}:${environment.clientSecret}`));
  }

  login(userInfo: LoginInfo) {
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('password', userInfo.password);
    params.append('username', userInfo.username);
    const headers = this.getAuthHeaders();
    return this.http
      .post<Tokens>(`${environment.backendUrl}/oauth/token`, params.toString(), {headers})
      .subscribe(response => {
          this.storeTokens(response);
          const expirationTime = Date.now() + environment.refreshTokenExpirationTimeMs; // now + 5 minutes
          this.refreshTokenExpirationTime = expirationTime;
          localStorage.setItem(this.REFRESH_TOKEN_EXPIRATION, (expirationTime).toString());
          this.setRefreshTokenExpirationCheckInterval();
          this.loginAttemptFailed = false;
          this.updateUserInfo();
          this.router.navigate(['/']);
        },
        () => {
          this.loginAttemptFailed = true;
        });
  }

  checkIfRefreshTokenActive() {
    if (this.refreshTokenExpirationTime) {
      if (this.refreshTokenExpirationTime < Date.now()) {
        localStorage.clear();
        clearInterval(this.refreshTokenExpirationInterval);
        this.router.navigate(['/login']);
      }
    } else {
      this.refreshTokenExpirationTime = localStorage.getItem(this.REFRESH_TOKEN_EXPIRATION);
    }
  }

  refreshToken(): Observable<Tokens> {
    const params = new URLSearchParams();
    this.setRefreshTokenExpirationCheckInterval();
    params.append('grant_type', 'refresh_token');
    params.append('refresh_token', this.getLocalStorageRefreshToken());
    const headers = this.getAuthHeaders();
    return this.http
      .post<Tokens>(`${environment.backendUrl}/oauth/token`, params.toString(), {headers})
      .pipe(tap((tokens: Tokens) => {
        this.storeTokens(tokens);
      }));
  }

  private setRefreshTokenExpirationCheckInterval(): void {
    this.refreshTokenExpirationInterval = setInterval(() => this.checkIfRefreshTokenActive(), 1000);
  }

  updateUserInfo(): void {
    if (!this.getLocalStorageAccessToken() && !this.getLocalStorageRefreshToken()) {
      return;
    }
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json');
    this.http
      .get<User>(`${environment.backendUrl}/api/user`, {headers})
      .subscribe(response => {
        this.sessionInfo = response;
      });
  }

  registerNewUser(newUser: User) {
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json');
    return this.http
      .post(`${environment.backendUrl}/oauth/register`, newUser, {headers});
  }

  public logout(): void {
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json');
    clearInterval(this.refreshTokenExpirationInterval);
    this.http.delete(`${environment.backendUrl}/oauth/revoke`, {headers})
      .subscribe(() => {
          delete this.sessionInfo;
          localStorage.clear();
          clearInterval(this.refreshTokenExpirationInterval);
          this.router.navigate(['/login']);
        }
      );
  }

}
