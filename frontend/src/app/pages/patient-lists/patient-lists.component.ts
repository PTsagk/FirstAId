import { Component } from '@angular/core';
import { PatientListComponent } from '../../components/patient-list/patient-list.component';

@Component({
  selector: 'app-patient-lists',
  standalone: true,
  imports: [PatientListComponent],
  templateUrl: './patient-lists.component.html',
  styleUrl: './patient-lists.component.scss',
})
export class PatientListsComponent {}
