import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { AppointmentListComponent } from '../../components/appointment-list/appointment-list.component';
import { MatInputModule } from '@angular/material/input';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment/environment';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-appointments-history',
  standalone: true,
  imports: [
    MatExpansionModule,
    MatButtonModule,
    AppointmentListComponent,
    MatInputModule,
  ],
  templateUrl: './appointments-history.component.html',
  styleUrl: './appointments-history.component.scss',
})
export class AppointmentsHistoryComponent {
  patients: any = null;
  constructor(private http: HttpClient, private snackBar: MatSnackBar) {
    this.http
      .get(environment.api_url + '/appointments/history', {
        withCredentials: true,
      })
      .subscribe({
        next: (res: any) => {
          this.patients = res;
        },
        error: (err) => {
          console.error('Error fetching appointment history:', err);
        },
      });
  }

  saveNotes(patientId: string, notes: string, email: string) {
    this.http
      .post(
        environment.api_url + '/notes',
        {
          patientId: patientId,
          notes: notes,
          email: email,
        },
        { withCredentials: true }
      )
      .subscribe({
        next: (res) => {
          console.log('Notes saved successfully:', res);
          this.snackBar.open('Notes saved successfully', '', {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: ['snackbar-success'],
          });
        },
        error: (err) => {
          console.error('Error saving notes:', err);
          this.snackBar.open('Error saving notes', '', {
            duration: 3000,
            verticalPosition: 'top',
            panelClass: ['snackbar-error'],
          });
        },
      });
  }
}
