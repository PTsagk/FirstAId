import { Injectable } from '@angular/core';
import { LoginComponent } from '../app/components/login/login.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RegisterComponent } from '../app/components/register/register.component';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  constructor(private dialog: MatDialog) {}

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
