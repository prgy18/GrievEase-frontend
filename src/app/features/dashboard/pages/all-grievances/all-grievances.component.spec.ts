import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllGrievancesComponent } from './all-grievances.component';

describe('AllGrievancesComponent', () => {
  let component: AllGrievancesComponent;
  let fixture: ComponentFixture<AllGrievancesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllGrievancesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllGrievancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
