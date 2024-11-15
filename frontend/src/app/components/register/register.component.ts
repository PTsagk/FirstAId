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
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  @Input() isDoctor: boolean = true;

  userInfo: FormGroup;
  constructor(
    private dialogRef: MatDialogRef<RegisterComponent>,
    public accountService: AccountService,
    private http: HttpClient,
    private fb: FormBuilder
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
    console.log(userInfo.value);
    if (userInfo.status != 'VALID') return;
    this.http
      .post(environment.api_url + '/users/register', userInfo.value)
      .subscribe((res) => {
        console.log(res);
      });
    this.dialogRef.close();
  }

  switchUser() {
    this.isDoctor = !this.isDoctor;
  }
}
