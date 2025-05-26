import { NgClass } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [MatSidenavModule, NgClass, RouterOutlet, RouterLink, MatButton],
  templateUrl: './doctor-dashboard.component.html',
  styleUrl: './doctor-dashboard.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class DoctorDashboardComponent {
  constructor() {}
}
