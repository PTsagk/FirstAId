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
    this.dataSource.paginator = this.paginator;
  }

  createAppointment() {
    this.dialog.open(CreateAppointmentComponent, {
      width: '500px',
    });
  }
}
