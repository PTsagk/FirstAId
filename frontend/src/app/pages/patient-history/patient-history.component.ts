import { Component } from '@angular/core';
import { PatientListComponent } from '../../components/patient-list/patient-list.component';

@Component({
  selector: 'app-patient-history',
  standalone: true,
  imports: [PatientListComponent],
  templateUrl: './patient-history.component.html',
  styleUrl: './patient-history.component.scss',
})
export class PatientHistoryComponent {}
