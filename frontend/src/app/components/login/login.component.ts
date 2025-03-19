import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AccountService } from '../../../services/account.service';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environment/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatFormFieldModule,
    CommonModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  @Input() isDoctor: boolean = true;
  userInfo: FormGroup;
  pending: boolean = false;
  constructor(
    private dialogRef: MatDialogRef<LoginComponent>,
    private dialog: MatDialog,
    public accountService: AccountService,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.userInfo = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
    });
  }
  switchUser() {
    this.isDoctor = !this.isDoctor;
  }

  onSubmit(userInfo: FormGroup) {
    // set proffesion to None

    if (userInfo.status != 'VALID') return;
    this.pending = true;
    this.http
      .post(
        environment.api_url +
          `/users/${this.isDoctor ? 'doctors' : 'patients'}/login`,
        userInfo.value,
        { withCredentials: true }
      )
      .subscribe({
        next: (res: any) => {
          this.dialogRef.close();
          this.snackBar.open('Login Successful', '', {
            duration: 2000,
            verticalPosition: 'top',
          });
          this.pending = false;
          this.accountService.userInfo.next(res);
          if (this.isDoctor) {
            this.router.navigate(['/doctors/dashboard']);
          } else {
            this.router.navigate(['/patients/dashboard']);
          }
        },
        error: (err) => {
          this.pending = false;
          console.log(err);
          this.snackBar.open('Something went wrong', '', {
            duration: 2000,
            verticalPosition: 'top',
            panelClass: ['snackbar-error'],
          });
        },
      });
  }
}
