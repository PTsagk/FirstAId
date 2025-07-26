import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { AppointmentService } from '../../../services/appointment.service';
import { Appointment } from '../../../models/appointment.model';
import { PatientListComponent } from '../../components/patient-list/patient-list.component';
import { MatInputModule } from '@angular/material/input';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment/environment';

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
  constructor(private http: HttpClient) {
    this.http
      .get(environment.api_url + '/appointments/history', {
        withCredentials: true,
      })
      .subscribe({
        next: (res: any) => {
          this.users = res;
        },
        error: (err) => {
          console.error('Error fetching appointment history:', err);
        },
      });
  }
}
