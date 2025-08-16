import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Appointment } from '../../../models/appointment.model';
import {
  MatDrawer,
  MatDrawerContainer,
  MatDrawerContent,
} from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppointmentService } from '../../../services/appointment.service';
import { NotificationService } from '../../../services/notification.service';
import { NgStyle } from '@angular/common';
import moment from 'moment';

@Component({
  selector: 'app-user-history',
  standalone: true,
  imports: [
    MatPaginator,
    MatTableModule,
    MatButtonModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatRippleModule,
    MatProgressSpinnerModule,
    MatDrawer,
    MatDrawerContainer,
    MatDrawerContent,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    NgStyle,
  ],
  templateUrl: './user-history.component.html',
  styleUrl: './user-history.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class UserHistoryComponent {
  previousAppointments = [];
  pending: boolean = true;
  displayedColumns: string[] = [
    'fullname',
    'email',
    'severity',
    'date',
    'time',
  ];
  selectedAppointment: any = null;
  @ViewChild('sidebar', { static: true }) sidebar!: MatDrawer;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  dataSource = new MatTableDataSource(this.previousAppointments);
  constructor(
    private snackBar: MatSnackBar,
    private appointmentService: AppointmentService,
    private notificationService: NotificationService
  ) {
    this.appointmentService
      .getAppointmentHistory(false)
      .subscribe((appointments: any) => {
        this.previousAppointments = appointments;
        this.dataSource.sortingDataAccessor = (
          item: Appointment,
          property: string
        ) => {
          switch (property) {
            case 'doctorName':
              // @ts-ignore
              return item.doctorName.toLowerCase();
            case 'doctorEmail':
              // @ts-ignore
              return item.doctorEmail.toLowerCase();
            case 'severity':
              // Create a priority order for sorting
              const priorityOrder = {
                appointment: 0,
                emergency: 2,
                critical: 3,
              };
              return priorityOrder[item.severity] || 0;
            case 'date':
              // Convert string date to Date object for proper sorting
              return new Date(item.date).getTime();
            case 'time':
              // For time, you might need to parse it properly
              return item.time;
            default:
              return (item as any)[property];
          }
        };
        this.dataSource.data = appointments;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });
  }

  openAppointmentDetails(appointment: any) {
    if (this.selectedAppointment?._id == appointment._id) {
      this.sidebar.toggle();
      return;
    }
    this.sidebar.open();
    this.selectedAppointment = { ...appointment };
  }

  sendMessage(message: string) {
    const newMessage = {
      to: this.selectedAppointment.doctorEmail,
      from: this.selectedAppointment.email,
      message: message,
      fullname: this.selectedAppointment.fullname,
      date: moment().format('YYYY-MM-DD'),
      time: moment().format('hh:mm A'),
      appointmentId: this.selectedAppointment._id,
      userId: this.selectedAppointment.doctorId,
    };
    this.notificationService.sendUserMessage(newMessage).subscribe(
      (res: any) => {
        this.snackBar.open('Notification sent successfully', '', {
          duration: 2000,
          verticalPosition: 'top',
          panelClass: ['snackbar-success'],
        });
        this.selectedAppointment.messages.push({
          date: moment().format('YYYY-MM-DD'),
          time: moment().format('hh:mm A'),
          userType: 'patient',
          message: message,
        });
      },
      (err) => {
        this.snackBar.open('Something went wrong', '', {
          duration: 2000,
          verticalPosition: 'top',
          panelClass: ['snackbar-error'],
        });
      }
    );
  }
}
