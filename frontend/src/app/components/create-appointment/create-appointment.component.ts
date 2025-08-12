import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import {
  NgxMatTimepickerComponent,
  NgxMatTimepickerModule,
} from 'ngx-mat-timepicker';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AccountService } from '../../../services/account.service';
import { AppointmentService } from '../../../services/appointment.service';
import { Appointment } from '../../../models/appointment.model';
import { AsyncPipe } from '@angular/common';
import moment, { Moment } from 'moment';

@Component({
  selector: 'app-create-appointment',
  templateUrl: './create-appointment.component.html',
  styleUrls: ['./create-appointment.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatButtonModule,
    NgxMatTimepickerModule,
    MatProgressSpinnerModule,
    AsyncPipe,
  ],
})
export class CreateAppointmentComponent implements OnInit {
  @ViewChild('timePicker') timePicker!: NgxMatTimepickerComponent;
  appointmentInfo: FormGroup;
  pending: boolean = false;
  appointmentDuration: number = 0;
  workingStartTime!: any;
  workingEndTime!: any;
  constructor(
    public account: AccountService,
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<CreateAppointmentComponent>,
    private dialog: MatDialog,
    private appointmentService: AppointmentService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      date?: string;
      time?: string;
      update: boolean;
      appointmentInfo: Appointment;
    }
  ) {
    if (!this.data) {
      this.data = {
        date: undefined,
        time: undefined,
        update: false,
        appointmentInfo: {} as Appointment,
      };
    }

    this.account.userInfo.subscribe((user) => {
      if (user) {
        this.appointmentDuration = user.appointmentDuration || 15;
        this.workingStartTime = user.workingStartTime;
        this.workingEndTime = user.workingEndTime;
      }
    });

    this.appointmentInfo = this.fb.group({
      fullname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      description: ['', Validators.required],
      // severity: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
    });
  }

  ngOnInit() {
    if (this.data.date) {
      this.appointmentInfo.patchValue({
        date: this.data.date,
        time: this.data.time || '',
      });
    }
    if (this.data.update) {
      this.appointmentInfo.patchValue({
        fullname: this.data.appointmentInfo.fullname,
        email: this.data.appointmentInfo.email,
        description: this.data.appointmentInfo.description,
        // severity: this.data.appointmentInfo.severity,
        date: this.data.appointmentInfo.date,
        time: this.data.appointmentInfo.time,
      });
    }
  }

  onSubmit(form: FormGroup) {
    if (form.valid) {
      if (!this.isTimeInWorkingHours(moment(form.value.time, 'hh:mm A')))
        return;
      this.pending = true;
      if (this.data?.update) {
        const updatedAppointment = form.value;
        updatedAppointment._id = this.data.appointmentInfo._id;
        updatedAppointment.time = moment(
          updatedAppointment.time,
          'hh:mm A'
        ).format('hh:mm A');
        this.appointmentService
          .updateAppointment(updatedAppointment)
          .subscribe({
            next: (res: any) => {
              this.snackBar.open('Appointment updated successfuly', '', {
                duration: 2000,
                verticalPosition: 'top',
                panelClass: ['snackbar-success'],
              });
              this.dialog.closeAll();
              this.pending = false;
              this.appointmentService.refreshAppointments();
            },
          });
      } else {
        const appointmentInfo: Appointment = form.value;
        appointmentInfo.time = moment(appointmentInfo.time, 'hh:mm A').format(
          'hh:mm A'
        );
        appointmentInfo.appointmentDuration = this.appointmentDuration;
        this.http
          .post(
            environment.api_url + '/appointments/create',
            {
              appointmentInfo: appointmentInfo,
            },
            { withCredentials: true }
          )
          .subscribe({
            next: (res: any) => {
              this.snackBar.open('Appointment created successfuly', '', {
                duration: 2000,
                verticalPosition: 'top',
                panelClass: ['snackbar-success'],
              });
              this.dialogRef.close();
              this.pending = false;
              this.appointmentService.refreshAppointments();
            },
            error: (err) => {
              this.snackBar.open(err.error, '', {
                duration: 2000,
                verticalPosition: 'top',
                panelClass: ['snackbar-error'],
              });
              this.pending = false;
            },
          });
      }
    }
  }

  onTimeChanged(event: any) {
    const selectedTime = moment(event, 'hh:mm A');
    this.isTimeInWorkingHours(selectedTime);
  }

  isTimeInWorkingHours(selectedTime: Moment) {
    if (
      selectedTime.isBefore(moment(this.workingStartTime, 'hh:mm A')) ||
      selectedTime.isAfter(moment(this.workingEndTime, 'hh:mm A'))
    ) {
      this.snackBar.open(
        `Selected time must be between ${this.workingStartTime} and ${this.workingEndTime}`,
        '',
        {
          duration: 3000,
          verticalPosition: 'top',
          panelClass: ['snackbar-error'],
        }
      );
      this.appointmentInfo.patchValue({ time: '' });
      return false;
    }
    return true;
  }
}
