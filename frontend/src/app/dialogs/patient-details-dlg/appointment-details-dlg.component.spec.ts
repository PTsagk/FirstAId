import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentDetailsDlgComponent } from './appointment-details-dlg.component';

describe('AppointmentDetailsDlgComponent', () => {
  let component: AppointmentDetailsDlgComponent;
  let fixture: ComponentFixture<AppointmentDetailsDlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppointmentDetailsDlgComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentDetailsDlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
