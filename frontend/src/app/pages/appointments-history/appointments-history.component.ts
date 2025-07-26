import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { AppointmentService } from '../../../services/appointment.service';
import { Appointment } from '../../../models/appointment.model';
import { PatientListComponent } from '../../components/patient-list/patient-list.component';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-appointments-history',
  standalone: true,
  imports: [
    MatExpansionModule,
    MatButtonModule,
    PatientListComponent,
    MatInputModule,
  ],
  templateUrl: './appointments-history.component.html',
  styleUrl: './appointments-history.component.scss',
})
export class AppointmentsHistoryComponent {
  users: any = null;
  constructor(private appointmentService: AppointmentService) {
    // this.appointmentService.appointments.subscribe((appointments: any) => {
    //   if (appointments) {
    //     this.appointments = appointments.reduce(
    //       (acc: any, appointment: any) => {
    //         const email = appointment.email;
    //         if (!acc[email]) {
    //           acc[email] = [];
    //         }
    //         acc[email].push(appointment);
    //         return acc;
    //       },
    //       {}
    //     );
    //   }
    // });
    this.appointmentService.appointments.subscribe(
      (appointments: Appointment[]) => {
        if (appointments) {
          const emails = new Set(
            appointments.map((appt: Appointment) => appt.email)
          );
          this.users = Array.from(emails).map((email: string) => ({
            email,
            appointments: appointments.filter(
              (appt: Appointment) => appt.email === email
            ),
          }));
        }
      }
    );
  }
}
