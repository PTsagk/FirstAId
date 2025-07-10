import { NgClass } from '@angular/common';
import {
  Component,
  ViewChild,
  AfterViewInit,
  Input,
  Inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
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
import { AppointmentDetailsDlgComponent } from '../../dialogs/patient-details-dlg/appointment-details-dlg.component';
import { MatRippleModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import moment from 'moment';
import { ActivatedRoute } from '@angular/router';
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
    MatRippleModule,
    MatProgressSpinnerModule,
  ],
})
export class PatientListComponent implements AfterViewInit {
  pending: boolean = true;
  displayedColumns: string[] = [
    'fullname',
    'email',
    'severity',
    'date',
    'time',
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @Input() today: boolean = false;
  @Input() labelSearch: string = '';
  isHistory: boolean = false;
  constructor(
    private dialog: MatDialog,
    private appointmentService: AppointmentService,
    private route: ActivatedRoute
  ) {}

  patients = [];

  dataSource = new MatTableDataSource(this.patients);

  ngAfterViewInit() {
    this.route.data.subscribe((data) => {
      this.isHistory = data['isHistory'] || false;
    });
    this.appointmentService.appointments.subscribe((appointments: any) => {
      if (!appointments) {
        this.pending = true;
      } else {
        if (this.today) {
          const todayString = moment().format('YYYY-MM-DD');
          appointments = appointments.filter(
            (appointment: Appointment) =>
              appointment.date === todayString &&
              appointment.status !== 'completed'
          );
        }
        if (this.isHistory) {
          appointments = appointments.filter(
            (appointment: Appointment) => appointment.status === 'completed'
          );
        }

        if (this.labelSearch) {
          appointments = appointments.filter((appointment: Appointment) =>
            Object.keys(appointment).some(
              (key) =>
                appointment[key as keyof Appointment]
                  ?.toString()
                  .toLowerCase() === this.labelSearch?.toLowerCase()
            )
          );
        }
        this.patients = appointments;
        this.dataSource.data = this.patients;
        this.pending = false;
      }

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
            const priorityOrder = { appointment: 0, emergency: 2, critical: 3 };
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
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
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

  openAppointmentDetails(appointment: Appointment) {
    const dlg = this.dialog.open(AppointmentDetailsDlgComponent, {
      width: '800px',
      height: '600px',
    });
    dlg.componentInstance.appointmentInfo = appointment;
  }
}
