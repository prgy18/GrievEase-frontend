import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitGrievanceComponent } from './submit-grievance.component';

describe('SubmitGrievanceComponent', () => {
  let component: SubmitGrievanceComponent;
  let fixture: ComponentFixture<SubmitGrievanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmitGrievanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmitGrievanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
