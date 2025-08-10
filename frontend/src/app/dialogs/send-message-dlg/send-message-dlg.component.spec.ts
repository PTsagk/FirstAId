import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendMessageDlgComponent } from './send-message-dlg';

describe('SendMessageDlgComponent', () => {
  let component: SendMessageDlgComponent;
  let fixture: ComponentFixture<SendMessageDlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SendMessageDlgComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SendMessageDlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
