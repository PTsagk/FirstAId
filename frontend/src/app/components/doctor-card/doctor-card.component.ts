import { Component, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-doctor-card',
  standalone: true,
  imports: [MatButtonModule, MatExpansionModule],
  templateUrl: './doctor-card.component.html',
  styleUrl: './doctor-card.component.scss',
})
export class DoctorCardComponent {
  @Input() doctor!: {
    name: string;
    profession: string;
    city: string;
    address: string;
    rating: number;
    available: boolean;
    email: string;
  };
  @Input() sidebarRef: any;
}
