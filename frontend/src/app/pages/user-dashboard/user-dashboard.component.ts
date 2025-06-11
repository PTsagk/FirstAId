import { Component } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DoctorCardComponent } from '../../components/doctor-card/doctor-card.component';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [
    MatExpansionModule,
    MatFormField,
    MatInputModule,
    MatSelectModule,
    DoctorCardComponent,
  ],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss',
})
export class UserDashboardComponent {
  specialties: string[] = [
    'Cardiology',
    'Dermatology',
    'Endocrinology',
    'Gastroenterology',
    'Neurology',
    'Oncology',
    'Pediatrics',
    'Psychiatry',
    'Radiology',
    'Urology',
    'General Medicine',
    'Orthopedics',
    'Ophthalmology',
    'Gynecology',
  ];
  doctors: any[] = [
    {
      name: 'Dr. John Doe',
      specialty: 'Cardiology',
      location: 'New York, NY',
      rating: 4.5,
      available: true,
    },
    {
      name: 'Dr. Jane Smith',
      specialty: 'Dermatology',
      location: 'Los Angeles, CA',
      rating: 4.7,
      available: false,
    },
    {
      name: 'Dr. Emily Johnson',
      specialty: 'Pediatrics',
      location: 'Chicago, IL',
      rating: 4.8,
      available: true,
    },
    {
      name: 'Dr. Michael Brown',
      specialty: 'Neurology',
      location: 'Houston, TX',
      rating: 4.6,
      available: true,
    },
  ];
  availabilities: string[] = ['All', 'Open Now'];
}
