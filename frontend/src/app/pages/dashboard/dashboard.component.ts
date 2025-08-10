import { Component } from '@angular/core';
import { DashboardBoxComponent } from '../../components/dashboard-box/dashboard-box.component';
import { AppointmentListComponent } from '../../components/appointment-list/appointment-list.component';
import { CalendarComponent } from '../calendar/calendar.component';
import { AppointmentService } from '../../../services/appointment.service';
import { MatButton } from '@angular/material/button';
import moment from 'moment';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    DashboardBoxComponent,
    AppointmentListComponent,
    CalendarComponent,
    MatButton,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  counts = {
    appointment: 0,
    emergency: 0,
    critical: 0,
  };

  constructor(private appointmentService: AppointmentService) {
    this.appointmentService.appointments.subscribe((appointments: any) => {
      this.refresh();
      appointments.forEach(
        (appointment: {
          severity: 'appointment' | 'emergency' | 'critical';
          date: string;
        }) => {
          if (moment(appointment.date).isSame(moment(), 'day')) {
            this.counts[appointment.severity]++;
          }
        }
      );
    });
  }

  refresh(): void {
    Object.keys(this.counts).forEach((key) => {
      this.counts[key as keyof typeof this.counts] = 0;
    });
  }
}
