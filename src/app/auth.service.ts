import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import set = Reflect.set;
import {User} from './interfaces/interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuth = false;
  private token: string;
  private tokenTimer: any;

  userData: User;

  constructor(private httpClient: HttpClient) {}
  getToken() {
    return this.token;
  }

  signup(login: string, password: string) {
    const authData = {login, password};
    this.httpClient.post('http://localhost:3000/signup', authData)
      .subscribe(resp => {
        console.log(resp);
      });
  }
  //
  login(login: string, password: string) {
    const authData = {login, password};
    this.httpClient.post<{token: string, expiresIn: number, userId: string}>('http://localhost:3000/login', authData)
      .subscribe(resp => {
        this.isAuth = true;
        const expiresInDuration = resp.expiresIn;
        this.setAuthTimer(expiresInDuration);
        //
        this.token = resp.token;
        this.userData = {userName: login, userId: resp.userId};
        this.saveAuthData(this.token, new Date(Date.now() + expiresInDuration * 1000), this.userData);
      });
  }
  autoAuthUser() {
    const authInformation = this.getAuthData();
    if (!authInformation) { return; }
    const expDuration = authInformation.expirationDate.getTime() - Date.now();
    if (expDuration > 0) {
      this.token = authInformation.token;
      this.isAuth = true;
      this.userData = {userName: authInformation.userData.userName, userId: authInformation.userData.userId};
      this.setAuthTimer(expDuration / 1000);
    }
  }
  //
  logout() {
    this.token = null;
    this.isAuth = false;
    this.userData = null;
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
  }
  //
  private setAuthTimer(duration: number) {
    console.log('set Auth timer: ', duration);
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }
  isAuthenticated(): boolean {
    return this.isAuth;
  }
  private saveAuthData(token: string, expirationDate: Date, user: User) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userData', JSON.stringify(user));
  }
  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userData');
  }
  private getAuthData(): {token: string, expirationDate: Date, userData: User} | void {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userData = localStorage.getItem('userData');
    if (!token || !expirationDate) {
      return;
    }
    return {
      token,
      expirationDate: new Date(expirationDate),
      userData: JSON.parse(userData)
    };
  }
}
