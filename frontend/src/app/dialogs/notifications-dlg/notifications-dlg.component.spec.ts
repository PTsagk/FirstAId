import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationsDlgComponent } from './notifications-dlg.component';

describe('NotificationsDlgComponent', () => {
  let component: NotificationsDlgComponent;
  let fixture: ComponentFixture<NotificationsDlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationsDlgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NotificationsDlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
