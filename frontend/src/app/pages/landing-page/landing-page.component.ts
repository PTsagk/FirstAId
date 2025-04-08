import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { AccountService } from '../../../services/account.service';
import { FooterComponent } from '../../components/footer/footer.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [MatButtonModule, FooterComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent {
  constructor(public accountService: AccountService) {}
}
