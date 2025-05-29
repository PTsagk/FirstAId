import { Component } from '@angular/core';
import { DashboardBoxComponent } from '../../components/dashboard-box/dashboard-box.component';
import { PatientListComponent } from '../../components/patient-list/patient-list.component';
import { CalendarComponent } from '../calendar/calendar.component';
import { AppointmentService } from '../../../services/appointment.service';
import { MatButton } from '@angular/material/button';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    DashboardBoxComponent,
    PatientListComponent,
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
        }) => {
          this.counts[appointment.severity]++;
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
