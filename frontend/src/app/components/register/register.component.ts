import { Component, Input } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../../services/account.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environment/environment';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  NgForm,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  @Input() isDoctor: boolean = true;

  userInfo: FormGroup;
  pending: boolean = false;
  constructor(
    private dialogRef: MatDialogRef<RegisterComponent>,
    public accountService: AccountService,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.userInfo = new FormGroup({
      name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [Validators.required]),
      city: new FormControl('', [Validators.required]),
      address: new FormControl('', [Validators.required]),
      profession: new FormControl('', [Validators.required]),
    });
  }
  onSubmit(userInfo: FormGroup) {
    // set proffesion to None

    if (userInfo.status != 'VALID') return;
    this.pending = true;
    this.http
      .post(
        environment.api_url +
          `/users/${this.isDoctor ? 'doctors' : 'patients'}/register`,
        userInfo.value
      )
      .subscribe({
        next: (res: any) => {
          this.dialogRef.close();
          this.snackBar.open('Account created successfully', '', {
            duration: 2000,
            verticalPosition: 'top',
          });
        },
        error: (err) => {
          this.pending = false;
          this.snackBar.open('Something went wrong', '', {
            duration: 2000,
            verticalPosition: 'top',
          });
        },
      });
  }

  switchUser() {
    this.isDoctor = !this.isDoctor;
    if (!this.isDoctor) this.userInfo.get('profession')?.setValue('None');
    else this.userInfo.get('profession')?.setValue('');
  }
}
