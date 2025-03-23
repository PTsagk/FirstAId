import { Component } from '@angular/core';
import { DashboardBoxComponent } from '../../components/dashboard-box/dashboard-box.component';
import { PatientListComponent } from '../../components/patient-list/patient-list.component';
import { CalendarComponent } from '../calendar/calendar.component';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DashboardBoxComponent, PatientListComponent, CalendarComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {}
