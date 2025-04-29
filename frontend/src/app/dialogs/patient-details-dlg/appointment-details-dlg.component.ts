import { Component } from '@angular/core';
import { Appointment } from '../../../models/appointment.model';
import { MatDialog } from '@angular/material/dialog';
import { CreateAppointmentComponent } from '../../components/create-appointment/create-appointment.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment/environment';
import { AppointmentService } from '../../../services/appointment.service';

@Component({
  selector: 'app-appointment-details-dlg',
  standalone: true,
  imports: [],
  templateUrl: './appointment-details-dlg.component.html',
  styleUrl: './appointment-details-dlg.component.scss',
})
export class AppointmentDetailsDlgComponent {
  appointmentInfo!: Appointment;
  constructor(
    private dialog: MatDialog,
    private http: HttpClient,
    private appointmentService: AppointmentService
  ) {}

  async editAppointment() {
    this.dialog.open(CreateAppointmentComponent, {
      width: '500px',
      data: {
        update: true,
        appointmentInfo: this.appointmentInfo,
      },
    });
  }

  async deleteAppointment() {
    const appointmentId = this.appointmentInfo._id;
    this.http
      .delete(environment.api_url + `/appointments/delete/${appointmentId}`, {
        withCredentials: true,
      })
      .subscribe({
        next: (res: any) => {
          this.appointmentService.refreshAppointments();
          this.dialog.closeAll();
        },
        error: (err) => {
          console.log(err);
        },
      });
  }
}
