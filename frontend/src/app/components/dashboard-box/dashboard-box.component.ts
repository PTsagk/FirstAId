import { NgClass, NgStyle } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dashboard-box',
  templateUrl: './dashboard-box.component.html',
  styleUrls: ['./dashboard-box.component.scss'],
  imports: [NgClass, NgStyle],
  standalone: true,
})
export class DashboardBoxComponent {
  @Input() icon!: string;
  @Input() title!: string;
  @Input() value!: number;
  @Input() description!: string;
  @Input() color!: string;
}
