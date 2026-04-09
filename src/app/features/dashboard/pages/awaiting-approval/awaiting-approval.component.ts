import { Component } from '@angular/core';
import { OfficialGrievancesComponent } from '../official-grievances/official-grievances.component';

@Component({
  selector: 'app-awaiting-approval',
  standalone: true,
  imports: [OfficialGrievancesComponent],
  template: `<app-official-grievances mode="awaiting-approval"></app-official-grievances>`
})
export class AwaitingApprovalComponent {}
