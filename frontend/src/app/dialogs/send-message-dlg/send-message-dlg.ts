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
import moment from 'moment';
import { AccountService } from '../../../services/account.service';
import { from } from 'rxjs';

@Component({
  selector: 'app-send-message-dlg',
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
  templateUrl: './send-message-dlg.component.html',
  styleUrl: './send-message-dlg.component.scss',
})
export class SendMessageDlgComponent implements OnInit {
  appointmentInfo!: Appointment;
  scheduleDateTime!: FormGroup;
  pending: boolean = false;
  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SendMessageDlgComponent>,
    private accountService: AccountService
  ) {}
  ngOnInit(): void {
    this.scheduleDateTime = this.fb.group({
      date: [this.appointmentInfo.date],
      time: [this.appointmentInfo.time],
      messageReason: [''],
    });
  }
  sendMessage(form: FormGroup) {
    if (!form.valid) return;
    this.pending = true;
    const notification = {
      date: moment(form.value.date).format('YYYY-MM-DD'),
      time: form.value.time,
      messageReason: form.value.messageReason,
      to: this.appointmentInfo.email,
      from: this.accountService.userInfo.getValue().email,
      doctorNotes: this.appointmentInfo.doctorNotes,
      patientNotes: this.appointmentInfo.description,
      fullname: this.appointmentInfo.fullname,
      appointmentId: this.appointmentInfo._id,
      patientId: this.appointmentInfo.patientId,
      doctorName: this.accountService.userInfo.getValue().name,
    };
    this.http
      .post(
        environment.api_url + '/notifications/doctor-message',
        notification,
        {
          withCredentials: true,
        }
      )
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
