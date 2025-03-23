import { NgClass, NgFor } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.scss'],
  standalone: true,
  imports: [NgClass, NgFor],
})
export class PatientListComponent {
  patients = [
    {
      name: 'Adam Messy',
      ward: '#123456',
      priority: 'Medium',
      startDate: 'June 3, 2023',
      endDate: '--',
    },
    {
      name: 'Celine Aluista',
      ward: '#985746',
      priority: 'Low',
      startDate: 'May 31, 2023',
      endDate: 'June 4, 2023',
    },
    {
      name: 'Malachi Ardo',
      ward: '#047638',
      priority: 'High',
      startDate: 'June 7, 2023',
      endDate: '--',
    },
    {
      name: 'Mathias Olivera',
      ward: '#248957',
      priority: 'Medium',
      startDate: 'June 1, 2023',
      endDate: 'June 5, 2023',
    },
  ];
}
