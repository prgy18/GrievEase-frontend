import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficialGrievancesComponent } from './official-grievances.component';

describe('OfficialGrievancesComponent', () => {
  let component: OfficialGrievancesComponent;
  let fixture: ComponentFixture<OfficialGrievancesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfficialGrievancesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfficialGrievancesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
