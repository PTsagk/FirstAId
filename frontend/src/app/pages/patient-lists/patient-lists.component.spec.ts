import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientListsComponent } from './patient-lists.component';

describe('PatientListComponent', () => {
  let component: PatientListsComponent;
  let fixture: ComponentFixture<PatientListsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientListsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientListsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
