import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-doctor-card',
  standalone: true,
  imports: [],
  templateUrl: './doctor-card.component.html',
  styleUrl: './doctor-card.component.scss',
})
export class DoctorCardComponent {
  @Input() doctor!: {
    name: string;
    specialty: string;
    location: string;
    rating: number;
    available: boolean;
  };
}
