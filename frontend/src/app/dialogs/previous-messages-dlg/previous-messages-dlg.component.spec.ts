import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviousMessagesDlgComponent } from './previous-messages-dlg.component';

describe('PreviousMessagesDlgComponent', () => {
  let component: PreviousMessagesDlgComponent;
  let fixture: ComponentFixture<PreviousMessagesDlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreviousMessagesDlgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PreviousMessagesDlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
