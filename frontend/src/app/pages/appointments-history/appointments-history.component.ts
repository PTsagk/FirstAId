import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { AppointmentListComponent } from '../../components/appointment-list/appointment-list.component';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppointmentService } from '../../../services/appointment.service';
import { AccountService } from '../../../services/account.service';

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
  constructor(
    private snackBar: MatSnackBar,
    private appointmentService: AppointmentService,
    private accountService: AccountService
  ) {
    this.appointmentService.getAppointmentHistory().subscribe({
      next: (res: any) => {
        this.patients = res;
      },
      error: (err) => {
        console.error('Error fetching appointment history:', err);
      },
    });
  }

  saveNotes(patientId: string, notes: string, email: string) {
    this.accountService.updateUserNotes(patientId, notes, email).subscribe({
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
