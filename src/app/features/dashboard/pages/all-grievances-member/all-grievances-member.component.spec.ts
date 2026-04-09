import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllGrievancesMemberComponent } from './all-grievances-member.component';

describe('AllGrievancesMemberComponent', () => {
  let component: AllGrievancesMemberComponent;
  let fixture: ComponentFixture<AllGrievancesMemberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllGrievancesMemberComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllGrievancesMemberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
