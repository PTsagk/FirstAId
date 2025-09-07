import { Component, Input } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../../services/account.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environment/environment';
import moment from 'moment';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MedicalHistoryItemComponent } from '../medical-history-item/medical-history-item.component';
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
    MedicalHistoryItemComponent,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  @Input() isDoctor: boolean = true;

  patientInfo: FormGroup;
  doctorInfo: FormGroup;
  pending: boolean = false;
  specialDates: string[] = [];
  medicalHistory: { text: string; type: string }[] = [];
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
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.patientInfo = new FormGroup({
      name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      telephone: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [Validators.required]),
      city: new FormControl('', [Validators.required]),
      address: new FormControl('', [Validators.required]),
      gender: new FormControl([], [Validators.required]),
      dateOfBirth: new FormControl('', [Validators.required]),
      bloodType: new FormControl([], [Validators.required]),
      weight: new FormControl('', [Validators.required]),
      height: new FormControl('', [Validators.required]),
      // allergies: new FormControl('', []),
      // chronicConditions: new FormControl('', []),
      // prescriptions: new FormControl('', []),
      // mentalHealthHistory: new FormControl('', []),
      // pastSurgeries: new FormControl('', []),
      medicalHistory: new FormControl([], []),
    });

    this.doctorInfo = new FormGroup({
      name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      telephone: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
      confirmPassword: new FormControl('', [Validators.required]),
      city: new FormControl('', [Validators.required]),
      address: new FormControl('', [Validators.required]),
      profession: new FormControl('', [Validators.required]),
      workingDays: new FormControl('', [Validators.required]),
      workingStartTime: new FormControl('', [Validators.required]),
      workingEndTime: new FormControl('', [Validators.required]),
      specialDates: new FormControl([], []),
      appointmentDuration: new FormControl(0, [Validators.required]),
    });
  }

  onSubmit(userInfo: FormGroup) {
    if (userInfo.status != 'VALID') return;
    this.pending = true;
    this.doctorInfo.patchValue({
      specialDates: this.specialDates,
    });
    this.patientInfo.patchValue({
      medicalHistory: this.medicalHistory,
    });
    this.accountService.register(this.isDoctor, userInfo).subscribe({
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
    // if (!this.isDoctor) {
    //   this.userInfo.patchValue({ profession: 'None' });
    //   this.userInfo.patchValue({ workingDays: 'None' });
    //   this.userInfo.patchValue({ workingStartTime: 'None' });
    //   this.userInfo.patchValue({ workingEndTime: 'None' });
    //   this.userInfo.patchValue({ specialDates: 'None' });
    //   this.userInfo.patchValue({ appointmentDuration: 0 });
    // } else this.userInfo.get('profession')?.setValue('None');
  }

  addEvent(event: any) {
    if (event.value) {
      this.specialDates.push(moment(event.value).format('MM/DD'));
    }
  }

  addHistory() {
    const dlg = this.dialog.open(MedicalHistoryItemComponent, {
      width: '800px',
    });

    dlg.afterClosed().subscribe((result) => {
      if (result && !this.medicalHistory.includes(result)) {
        this.medicalHistory.push(result);
      }
    });
  }

  removeDate(event: any) {
    const index = this.specialDates.indexOf(moment(event).format('MM/DD'));
    if (index > -1) {
      this.specialDates.splice(index, 1);
    }
  }

  removeHistory(event: any) {
    const index = this.medicalHistory.indexOf(event);
    if (index > -1) {
      this.medicalHistory.splice(index, 1);
    }
  }
}
