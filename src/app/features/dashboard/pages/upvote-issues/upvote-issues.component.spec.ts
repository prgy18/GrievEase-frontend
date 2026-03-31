import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpvoteIssuesComponent } from './upvote-issues.component';

describe('UpvoteIssuesComponent', () => {
  let component: UpvoteIssuesComponent;
  let fixture: ComponentFixture<UpvoteIssuesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpvoteIssuesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpvoteIssuesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
