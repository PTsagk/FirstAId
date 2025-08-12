import { Component, ViewEncapsulation } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class UserDashboardComponent {}
