import { NgClass } from '@angular/common';
import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CreateAppointmentComponent } from '../create-appointment/create-appointment.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environment/environment';

@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.scss'],
  standalone: true,
  imports: [MatPaginator, MatTableModule, NgClass, MatButtonModule],
})
export class PatientListComponent implements AfterViewInit {
  displayedColumns: string[] = ['name', 'email', 'priority', 'date', 'time'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  constructor(private dialog: MatDialog, private http: HttpClient) {}

  patients = [
    {
      name: 'Adam Messy',
      email: 'test@gmail.com',
      priority: 'Medium',
      date: 'June 3, 2023',
      time: '10:00 AM',
    },
    {
      name: 'Celine Aluista',
      email: 'test@gmail.com',
      priority: 'Low',
      date: 'May 31, 2023',
      time: '10:00 AM',
    },
    {
      name: 'Malachi Ardo',
      email: 'test@gmail.com',
      priority: 'High',
      date: 'June 7, 2023',
      time: '10:00 AM',
    },
    {
      name: 'Mathias Olivera',
      email: 'test@gmail.com',
      priority: 'Medium',
      date: 'June 1, 2023',
      time: '10:00 AM',
    },
    {
      name: 'Mathias Olivera',
      email: 'test@gmail.com',
      priority: 'Medium',
      date: 'June 1, 2023',
      time: '10:00 AM',
    },
    {
      name: 'Mathias Olivera',
      email: 'test@gmail.com',
      priority: 'Medium',
      date: 'June 1, 2023',
      time: '10:00 AM',
    },
    {
      name: 'Mathias Olivera',
      email: 'test@gmail.com',
      priority: 'Medium',
      date: 'June 1, 2023',
      time: '10:00 AM',
    },
    // Add more patient data as needed
  ];

  dataSource = new MatTableDataSource(this.patients);
  ngAfterViewInit() {
    this.http
      .get(environment.api_url + '/appointments', {
        withCredentials: true,
      })
      .subscribe({
        next: (res: any) => {
          this.dataSource.data = res.appointments.map((appointment: any) => {
            return {
              name: appointment.patient.fullname,
              email: appointment.patient.email,
              priority: appointment.severity,
              date: appointment.appointmentDate,
              time: appointment.appointmentTime,
            };
          });
        },
        error: (err) => {
          console.log(err);
        },
      });
    this.dataSource.paginator = this.paginator;
  }

  createAppointment() {
    const modal = this.dialog.open(CreateAppointmentComponent, {
      width: '500px',
    });
  }
}
