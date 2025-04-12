import { NgClass } from '@angular/common';
import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CreateAppointmentComponent } from '../create-appointment/create-appointment.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment/environment';
import { AppointmentService } from '../../../services/appointment.service';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Appointment } from '../../../models/appointment.model';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.scss'],
  standalone: true,
  imports: [
    MatPaginator,
    MatTableModule,
    NgClass,
    MatButtonModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
})
export class PatientListComponent implements AfterViewInit {
  displayedColumns: string[] = [
    'fullname',
    'email',
    'severity',
    'date',
    'time',
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private dialog: MatDialog,
    private appointmentService: AppointmentService
  ) {}

  patients = [];

  dataSource = new MatTableDataSource(this.patients);

  ngAfterViewInit() {
    this.appointmentService.appointments.subscribe((appointments: any) => {
      this.patients = appointments;
      this.dataSource.data = this.patients;
    });

    this.dataSource.sortingDataAccessor = (
      item: Appointment,
      property: string
    ) => {
      switch (property) {
        case 'fullname':
          return item.fullname.toLowerCase();
        case 'email':
          return item.email.toLowerCase();
        case 'severity':
          // Create a priority order for sorting
          const priorityOrder = { low: 0, high: 2, critical: 3 };
          return priorityOrder[item.severity] || 0;
        case 'appointmentDate':
          // Convert string date to Date object for proper sorting
          return new Date(item.appointmentDate).getTime();
        case 'appointmentTime':
          // For time, you might need to parse it properly
          return item.appointmentTime;
        default:
          return (item as any)[property];
      }
    };
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  createAppointment() {
    this.dialog.open(CreateAppointmentComponent, {
      width: '500px',
    });
  }
  applyFilter(event: Event) {
    if (event.type == 'click') this.dataSource.filter = '';
    else {
      const filterValue = (event.target as HTMLInputElement).value;
      this.dataSource.filter = filterValue.trim().toLowerCase();

      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    }
  }
}
