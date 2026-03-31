import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyGrievancesComponent } from './my-grievances.component';

describe('MyGrievancesComponent', () => {
  let component: MyGrievancesComponent;
  let fixture: ComponentFixture<MyGrievancesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyGrievancesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyGrievancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
