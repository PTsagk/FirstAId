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
import {
  MatDatepickerModule,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import {
  NgxMatTimepickerComponent,
  NgxMatTimepickerModule,
} from 'ngx-mat-timepicker';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AccountService } from '../../../services/account.service';
import { AppointmentService } from '../../../services/appointment.service';

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
  ],
})
export class CreateAppointmentComponent implements OnInit {
  @ViewChild('timePicker') timePicker!: NgxMatTimepickerComponent;
  appointmentInfo: FormGroup;
  pending: boolean = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<CreateAppointmentComponent>,
    private appointmentService: AppointmentService,
    @Inject(MAT_DIALOG_DATA) private data: { appointmentDate: string }
  ) {
    this.appointmentInfo = this.fb.group({
      fullname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      description: ['', Validators.required],
      severity: ['', Validators.required],
      appointmentDate: ['', Validators.required],
      appointmentTime: ['', Validators.required],
    });
  }

  ngOnInit() {
    if (this.data.appointmentDate) {
      this.appointmentInfo.patchValue({
        appointmentDate: this.data.appointmentDate,
      });
    }
  }

  onSubmit(form: FormGroup) {
    if (form.valid) {
      this.pending = true;
      this.http
        .post(
          environment.api_url + '/appointments/create',
          {
            appointmentInfo: form.value,
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
            this.snackBar.open('Something went wrong', '', {
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
