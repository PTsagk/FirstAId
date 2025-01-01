import { Component } from '@angular/core';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { MatButtonModule } from '@angular/material/button';
import { AccountService } from '../../../services/account.service';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [NavbarComponent, MatButtonModule],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent {
  constructor(public accountService: AccountService) {}
}
