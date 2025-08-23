import { Injectable, OnInit } from '@angular/core';
import { LoginComponent } from '../app/components/login/login.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RegisterComponent } from '../app/components/register/register.component';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment/environment';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
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

  updateUserNotes(patientId: string, notes: string, email: string) {
    return this.http.post(
      environment.api_url + '/notes',
      {
        patientId: patientId,
        notes: notes,
        email: email,
      },
      { withCredentials: true }
    );
  }

  updatePatientPrescriptions(patientId: string, prescriptions: any) {
    return this.http.patch(
      environment.api_url + `/users/prescriptions`,
      { patientId, prescriptions },
      { withCredentials: true }
    );
  }

  getDoctors() {
    return this.http.get(environment.api_url + `/users/doctors`, {
      withCredentials: true,
    });
  }

  refreshUserInfo() {
    sessionStorage.removeItem('userInfo');
    this.fetchUserInfo();
  }

  loginModal(isDoctor: boolean = true) {
    this.dialog.closeAll();
    const modal = this.dialog.open(LoginComponent, {
      width: '80%',
      height: '750px',
    });
    modal.componentInstance.isDoctor = isDoctor;
  }

  registerModal(isDoctor: boolean = true) {
    this.dialog.closeAll();
    const modal = this.dialog.open(RegisterComponent, {
      width: '80%',
      height: '750px',
    });
    modal.componentInstance.isDoctor = isDoctor;
  }

  register(isDoctor: boolean = true, userInfo: FormGroup) {
    return this.http.post(
      environment.api_url +
        `/users/${isDoctor ? 'doctors' : 'patients'}/register`,
      userInfo.value
    );
  }
  login(isDoctor: boolean = true, userInfo: FormGroup) {
    return this.http.post(
      environment.api_url + `/users/${isDoctor ? 'doctors' : 'patients'}/login`,
      userInfo.value,
      { withCredentials: true }
    );
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
