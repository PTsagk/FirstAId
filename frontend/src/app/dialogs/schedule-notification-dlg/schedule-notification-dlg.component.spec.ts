import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleNotificationDlgComponent } from './schedule-notification-dlg.component';

describe('ScheduleNotificationDlgComponent', () => {
  let component: ScheduleNotificationDlgComponent;
  let fixture: ComponentFixture<ScheduleNotificationDlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScheduleNotificationDlgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ScheduleNotificationDlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
