import { Component } from '@angular/core';
import { DashboardBoxComponent } from '../../components/dashboard-box/dashboard-box.component';
import { PatientListComponent } from '../../components/patient-list/patient-list.component';
import { CalendarComponent } from '../calendar/calendar.component';
import { AppointmentService } from '../../../services/appointment.service';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DashboardBoxComponent, PatientListComponent, CalendarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  counts = {
    low: 0,
    medium: 0,
    high: 0,
  };

  constructor(private appointmentService: AppointmentService) {
    this.appointmentService.appointments.subscribe((appointments: any) => {
      appointments.forEach(
        (appointment: { severity: 'low' | 'medium' | 'high' }) => {
          this.counts[appointment.severity]++;
        }
      );
    });
  }
}
