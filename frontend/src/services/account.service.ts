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
    this.http
      .get(environment.api_url + `/users`, { withCredentials: true })
      .subscribe({
        next: (res: any) => {
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

  login(isDoctor: boolean = true) {
    this.dialog.closeAll();
    const modal = this.dialog.open(LoginComponent, {
      width: '80%',
      height: '80vh',
    });
    modal.componentInstance.isDoctor = isDoctor;

    // if (this.loginRef) this.loginRef.close();
  }

  register(isDoctor: boolean = true) {
    this.dialog.closeAll();
    const modal = this.dialog.open(RegisterComponent, {
      width: '80%',
      height: '80vh',
    });
    modal.componentInstance.isDoctor = isDoctor;
    // if (this.registerRef) this.registerRef.close();
  }
}
