import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicalHistoryItemComponent } from './medical-history-item.component';

describe('MedicalHistoryItemComponent', () => {
  let component: MedicalHistoryItemComponent;
  let fixture: ComponentFixture<MedicalHistoryItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicalHistoryItemComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MedicalHistoryItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
