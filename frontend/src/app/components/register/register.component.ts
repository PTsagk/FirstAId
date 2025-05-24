import { Component, Input } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../../services/account.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environment/environment';
import moment from 'moment';
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
import { MatStepperModule } from '@angular/material/stepper';
import { MatListOption, MatSelectionList } from '@angular/material/list';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import {
  MatDatepickerInputEvent,
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
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
    MatStepperModule,
    NgxMatTimepickerModule,
    MatDatepickerModule,
    MatIconModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  @Input() isDoctor: boolean = true;

  userInfo: FormGroup;
  pending: boolean = false;
  specialDates: string[] = [];
  daysArray: string[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
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
      workingDays: new FormControl('', [Validators.required]),
      workingStartTime: new FormControl('', [Validators.required]),
      workingEndTime: new FormControl('', [Validators.required]),
      specialDates: new FormControl([], [Validators.required]),
      appointmentDuration: new FormControl(0, [Validators.required]),
    });
  }
  onSubmit(userInfo: FormGroup) {
    // set proffesion to None
    if (!this.isDoctor) {
      this.userInfo.patchValue({ workingStartTime: 'None' });
      this.userInfo.patchValue({ workingEndTime: 'None' });
      this.userInfo.patchValue({ specialDates: 'None' });
    }
    if (userInfo.status != 'VALID') return;
    this.pending = true;
    this.userInfo.patchValue({
      specialDates: this.specialDates,
    });
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
          this.snackBar.open(err.error, '', {
            duration: 2000,
            verticalPosition: 'top',
            panelClass: ['snackbar-error'],
          });
        },
      });
  }

  switchUser() {
    this.isDoctor = !this.isDoctor;
    if (!this.isDoctor) {
      this.userInfo.patchValue({ profession: 'None' });
      this.userInfo.patchValue({ workingDays: 'None' });
      this.userInfo.patchValue({ workingStartTime: 'None' });
      this.userInfo.patchValue({ workingEndTime: 'None' });
      this.userInfo.patchValue({ specialDates: 'None' });
      this.userInfo.patchValue({ appointmentDuration: 0 });
    } else this.userInfo.get('profession')?.setValue('None');
  }

  addEvent(event: any) {
    if (event.value) {
      this.specialDates.push(moment(event.value).format('MM/DD'));
    }
  }

  removeDate(event: any) {
    const index = this.specialDates.indexOf(moment(event).format('MM/DD'));
    if (index > -1) {
      this.specialDates.splice(index, 1);
    }
  }
}
