import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GrievanceService } from '../../../../core/services/grievance.service';
import { Grievance, GrievanceStatus } from '../../../../core/models/grievance.model';
import { DEPARTMENTS } from '../../../../core/constants/departments.constants';

type SortOption = 'recent' | 'oldest' | 'upvotes';

@Component({
  selector: 'app-all-grievances-member',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './all-grievances-member.component.html',
  styleUrls: ['./all-grievances-member.component.css']
})
export class AllGrievancesMemberComponent implements OnInit {

  grievances:   Grievance[] = [];
  isLoading     = true;
  errorMessage  = '';

  // Filters
  searchName   = '';
  searchDesc   = '';
  filterDept   = '';
  filterStatus: GrievanceStatus | '' = '';
  filterCity   = '';
  filterPincode = '';
  sortBy: SortOption = 'recent';

  currentPage  = 1;
  readonly pageSize = 12;
  totalPages   = 1;
  totalRecords = 0;

  readonly departments = DEPARTMENTS;
  readonly statusOptions: { value: GrievanceStatus | ''; label: string }[] = [
    { value: '',                 label: 'All Statuses'       },
    { value: 'pending',          label: 'Pending'            },
    { value: 'in process',       label: 'In Process'         },
    { value: 'awaiting approval',label: 'Awaiting Approval'  },
    { value: 'solved',           label: 'Solved'             },
  ];

  readonly sortOptions: { key: SortOption; label: string; icon: string }[] = [
    { key: 'recent',  label: 'Most Recent',  icon: 'fa-clock'     },
    { key: 'oldest',  label: 'Oldest',       icon: 'fa-hourglass' },
    { key: 'upvotes', label: 'Most Upvoted', icon: 'fa-thumbs-up' },
  ];

  constructor(private grievanceService: GrievanceService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.grievanceService.getAll({
      pageNumber: this.currentPage,
      pageSize:   this.pageSize,
      sortBy:     this.sortBy,
      status:     this.filterStatus || undefined,
      department: this.filterDept   || undefined,
      city:       this.filterCity   || undefined,
      pincode:    this.filterPincode || undefined,
      name:       this.searchName   || undefined,
    }).subscribe({
      next: (res) => {
        this.grievances   = res.data;
        this.totalPages   = res.totalPages;
        this.totalRecords = res.totalRecords;
        this.isLoading    = false;
      },
      error: () => {
        this.errorMessage = 'Could not load grievances. Please refresh.';
        this.isLoading = false;
      }
    });
  }

  onFilter(): void { this.currentPage = 1; this.load(); }
  onSort(s: SortOption): void { this.sortBy = s; this.currentPage = 1; this.load(); }

  changePage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p; this.load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get pageNumbers(): number[] {
    const start = Math.max(1, this.currentPage - 2);
    const end   = Math.min(this.totalPages, this.currentPage + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  resetFilters(): void {
    this.searchName    = '';
    this.searchDesc    = '';
    this.filterDept    = '';
    this.filterStatus  = '';
    this.filterCity    = '';
    this.filterPincode = '';
    this.currentPage   = 1;
    this.load();
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-IN',
      { day: '2-digit', month: 'short', year: 'numeric' });
  }

  deptIcon(dept: string): string {
    const map: Record<string, string> = {
      'Water-Works': 'fa-tint', 'Roadways': 'fa-road',
      'Electricity': 'fa-bolt', 'Sanitation': 'fa-trash-alt',
      'Street-Lights': 'fa-lightbulb', 'Drainage': 'fa-water',
    };
    return map[dept] ?? 'fa-building';
  }

  trackById(_: number, g: Grievance): string { return g.id; }
}