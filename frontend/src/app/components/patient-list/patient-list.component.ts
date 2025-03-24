import { NgClass } from '@angular/common';
import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.scss'],
  standalone: true,
  imports: [MatPaginator, MatTableModule, NgClass],
})
export class PatientListComponent implements AfterViewInit {
  displayedColumns: string[] = [
    'name',
    'ward',
    'priority',
    'startDate',
    'endDate',
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

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
    {
      name: 'Mathias Olivera',
      ward: '#248957',
      priority: 'Medium',
      startDate: 'June 1, 2023',
      endDate: 'June 5, 2023',
    },
    {
      name: 'Mathias Olivera',
      ward: '#248957',
      priority: 'Medium',
      startDate: 'June 1, 2023',
      endDate: 'June 5, 2023',
    },
    {
      name: 'Mathias Olivera',
      ward: '#248957',
      priority: 'Medium',
      startDate: 'June 1, 2023',
      endDate: 'June 5, 2023',
    },
    // Add more patient data as needed
  ];
  dataSource = new MatTableDataSource(this.patients);

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
}
