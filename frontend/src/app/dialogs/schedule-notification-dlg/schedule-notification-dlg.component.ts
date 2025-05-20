import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../environment/environment';
import { Appointment } from '../../../models/appointment.model';
import {
  Form,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { NgxMatTimepickerModule } from 'ngx-mat-timepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-schedule-notification-dlg',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    NgxMatTimepickerModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
  ],
  templateUrl: './schedule-notification-dlg.component.html',
  styleUrl: './schedule-notification-dlg.component.scss',
})
export class ScheduleNotificationDlgComponent implements OnInit {
  appointmentInfo!: Appointment;
  scheduleDateTime!: FormGroup;
  pending: boolean = false;
  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ScheduleNotificationDlgComponent>
  ) {}
  ngOnInit(): void {
    this.scheduleDateTime = this.fb.group({
      date: [this.appointmentInfo.date],
      time: [this.appointmentInfo.time],
    });
  }
  scheduleNotification(form: FormGroup) {
    if (!form.valid) return;
    this.pending = true;
    const notification = {
      date: form.value.date,
      time: form.value.time,
      to: this.appointmentInfo.email,
      doctorNotes: this.appointmentInfo.doctorNotes,
      patientNotes: this.appointmentInfo.description,
      fullname: this.appointmentInfo.fullname,
    };
    this.http
      .post(environment.api_url + '/notifications/create', notification, {
        withCredentials: true,
      })
      .subscribe((res) => {
        this.dialogRef.close();
        this.pending = false;
        this.snackBar.open('Notification scheduled', '', {
          duration: 2000,
          verticalPosition: 'top',
          panelClass: ['snackbar-success'],
        });
      });
  }
}
