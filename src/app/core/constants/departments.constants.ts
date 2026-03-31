// ─────────────────────────────────────────────────────────────
// src/app/core/constants/departments.constants.ts
//
// Single source of truth for department values.
// Must stay in sync with backend Departments.cs constants.
// Used in: register form, submit grievance form, filters.
// ─────────────────────────────────────────────────────────────

export interface Department {
  value: string;   // exact string sent to / received from backend
  label: string;   // display label in UI
  icon:  string;   // Font Awesome icon class
}

export const DEPARTMENTS: Department[] = [
  { value: 'Water-Works',    label: 'Water Works',    icon: 'fa-tint'        },
  { value: 'Roadways',       label: 'Roadways',       icon: 'fa-road'        },
  { value: 'Electricity',    label: 'Electricity',    icon: 'fa-bolt'        },
  { value: 'Sanitation',     label: 'Sanitation',     icon: 'fa-trash-alt'   },
  { value: 'Street-Lights',  label: 'Street Lights',  icon: 'fa-lightbulb'   },
  { value: 'Drainage',       label: 'Drainage',       icon: 'fa-water'       },
];

// Plain string array — used for validation and select options
export const DEPARTMENT_VALUES: string[] = DEPARTMENTS.map(d => d.value);