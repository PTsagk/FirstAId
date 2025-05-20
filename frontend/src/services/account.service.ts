import { Injectable, OnInit } from '@angular/core';
import { LoginComponent } from '../app/components/login/login.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RegisterComponent } from '../app/components/register/register.component';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  userInfo = new BehaviorSubject<any>(null);
  constructor(
    private dialog: MatDialog,
    private http: HttpClient,
    private router: Router
  ) {
    const cachedUserInfo = sessionStorage.getItem('userInfo');

    if (cachedUserInfo) {
      const userInfo = JSON.parse(cachedUserInfo);
      this.userInfo.next(userInfo);

      if (this.router.url.includes('/home')) {
        this.router.navigate([`/${userInfo.userType}/dashboard`]);
      }
    } else {
      this.fetchUserInfo();
    }
  }

  private fetchUserInfo() {
    this.http
      .get(environment.api_url + `/users`, { withCredentials: true })
      .subscribe({
        next: (res: any) => {
          sessionStorage.setItem('userInfo', JSON.stringify(res));
          this.userInfo.next(res);

          if (this.router.url.includes('/home'))
            this.router.navigate([`/${res.userType}/dashboard`]);
        },
        error: (err) => {
          console.log(err);
          this.userInfo.next(null);
          this.router.navigate(['/home']);
        },
      });
  }

  refreshUserInfo() {
    sessionStorage.removeItem('userInfo');
    this.fetchUserInfo();
  }

  login(isDoctor: boolean = true) {
    this.dialog.closeAll();
    const modal = this.dialog.open(LoginComponent, {
      width: '80%',
      height: '80vh',
    });
    modal.componentInstance.isDoctor = isDoctor;
  }

  register(isDoctor: boolean = true) {
    this.dialog.closeAll();
    const modal = this.dialog.open(RegisterComponent, {
      width: '80%',
      height: '80vh',
    });
    modal.componentInstance.isDoctor = isDoctor;
  }

  logout() {
    this.http
      .get(environment.api_url + '/users/logout', { withCredentials: true })
      .subscribe({
        next: (res) => {
          sessionStorage.removeItem('userInfo');
          this.userInfo.next(null);
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.log(err);
        },
      });
  }
}
