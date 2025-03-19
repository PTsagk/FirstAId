import { NgClass } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [MatSidenavModule, NgClass, RouterOutlet, RouterLink],
  templateUrl: './doctor-dashboard.component.html',
  styleUrl: './doctor-dashboard.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class DoctorDashboardComponent {
  constructor() {}
}
