import React, { useState, useEffect } from 'react';
import { ModuleType, TrainingTrack } from './types';
import { CASE_MANAGER_MODULES, FACILITATOR_MODULES, BOARD_MODULES } from './constants';
import ModuleView from './components/ModuleView';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Manual from './components/Manual';
import GeminiAssistant from './components/GeminiAssistant';
import LoginPage from './components/LoginPage';
import TrainingLoginPage from './components/TrainingLoginPage';
import TrainingTrackSelector from './components/TrainingTrackSelector';
import FinancialLoginPage from './components/FinancialLoginPage';
import Hub from './components/Hub';
import DataExchange from './components/DataExchange';
import FinanceBills, { BillEntry } from './components/FinanceBills';
import FinanceDashboard from './components/FinanceDashboard';
import FinanceReports from './components/FinanceReports';
import MultiFunderDashboard from './components/MultiFunderDashboard';
import DatabasePortal from './components/DatabasePortal';
import AdminPortal from './components/AdminPortal';
import FatherhoodTracking from './components/FatherhoodTracking';
import CaseManagerPortal from './components/CaseManagerPortal';
import CaseManagerHub from './components/CaseManagerHub';
import ClassAssessment from './components/tracking/ClassAssessment';
import FatherProgress from './components/tracking/FatherProgress';
import FatherCheckIn from './components/tracking/FatherCheckIn';

// Pre-loaded Treasury transactions from FOAM Financial Tracker v3
// Total: 110 transactions, $101,578.82
// Q3 2025 (Jul-Sep): 81 transactions
// Q4 2025 (Oct-Nov): 29 transactions
const PRELOADED_FINANCE_DATA: BillEntry[] = [
  {
    id: 'treasury-001',
    name: 'Adobe:  Monthly fee',
    amount: 33.15,
    mainCategory: 'Operating Services',
    subCategory: 'Software Subscriptions',
    vendor: '',
    description: 'Adobe:  Monthly fee',
    referenceNumber: 'auto draft',
    paymentMethod: 'Auto Draft',
    payDate: '2025-07-01',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-002',
    name: 'Amazon Prime: monthly fee',
    amount: 16.56,
    mainCategory: 'Operating Services',
    subCategory: 'Software Subscriptions',
    vendor: '',
    description: 'Amazon Prime: monthly fee',
    referenceNumber: 'debit card',
    paymentMethod: 'Debit Card',
    payDate: '2025-07-01',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-003',
    name: 'Beam:  Dental Insurance',
    amount: 17.03,
    mainCategory: 'Related Benefits',
    subCategory: '',
    vendor: '',
    description: 'Beam:  Dental Insurance',
    referenceNumber: 'auto draft',
    paymentMethod: 'Auto Draft',
    payDate: '2025-07-03',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-004',
    name: 'Intuit: Leah Harrison payroll',
    amount: 1506.67,
    mainCategory: 'Gross Salaries',
    subCategory: '',
    vendor: '',
    description: 'Intuit: Leah Harrison payroll',
    referenceNumber: 'auto draft',
    paymentMethod: 'Auto Draft',
    payDate: '2025-07-03',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-005',
    name: 'Intuit: Levar Robinson payroll',
    amount: 2494.15,
    mainCategory: 'Gross Salaries',
    subCategory: '',
    vendor: '',
    description: 'Intuit: Levar Robinson payroll',
    referenceNumber: 'auto draft',
    paymentMethod: 'Auto Draft',
    payDate: '2025-07-03',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-006',
    name: 'Robin Pinkston: Case Worker',
    amount: 1260.0,
    mainCategory: 'Professional Services',
    subCategory: 'Case Manager Support Contractor (Direct Workforce Support)',
    vendor: 'Case Manager Support Contractor (Direct Workforce Support)',
    description: 'Robin Pinkston: Case Worker',
    referenceNumber: 'Check #224',
    paymentMethod: 'Check',
    payDate: '2025-07-03',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-007',
    name: 'Lawrence Morgan: Case Worker',
    amount: 1100.0,
    mainCategory: 'Professional Services',
    subCategory: 'Case Manager Support Contractor (Direct Workforce Support)',
    vendor: 'Case Manager Support Contractor (Direct Workforce Support)',
    description: 'Lawrence Morgan: Case Worker',
    referenceNumber: 'Check #225',
    paymentMethod: 'Check',
    payDate: '2025-07-03',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-008',
    name: 'Voices of Choices: Case Manager',
    amount: 1932.0,
    mainCategory: 'Professional Services',
    subCategory: 'Case Manager Support Contractor (Direct Workforce Support)',
    vendor: 'Case Manager Support Contractor (Direct Workforce Support)',
    description: 'Voices of Choices: Case Manager',
    referenceNumber: 'Check #223',
    paymentMethod: 'Check',
    payDate: '2025-07-03',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-009',
    name: 'CPA - Accounting',
    amount: 850.0,
    mainCategory: 'Professional Services',
    subCategory: 'Kidder & Schultz CPAs (Accounting & Payroll)',
    vendor: 'Kidder & Schultz CPAs (Accounting & Payroll)',
    description: 'CPA - Accounting',
    referenceNumber: 'auto draft',
    paymentMethod: 'Auto Draft',
    payDate: '2025-07-08',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-010',
    name: 'AmTrust: Workers Comp, Liability Insurance',
    amount: 149.5,
    mainCategory: 'Related Benefits',
    subCategory: '',
    vendor: '',
    description: 'AmTrust: Workers Comp, Liability Insurance',
    referenceNumber: 'auto draft',
    paymentMethod: 'Auto Draft',
    payDate: '2025-07-14',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-011',
    name: 'Rental Assistance: Ole London Towne Apts',
    amount: 250.0,
    mainCategory: 'Other Charges',
    subCategory: '',
    vendor: '',
    description: 'Rental Assistance: Ole London Towne Apts',
    referenceNumber: 'Ceck #226',
    paymentMethod: 'Other',
    payDate: '2025-07-14',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-012',
    name: 'AmTrust: Workers Comp, Liability Insurance',
    amount: 195.0,
    mainCategory: 'Related Benefits',
    subCategory: '',
    vendor: '',
    description: 'AmTrust: Workers Comp, Liability Insurance',
    referenceNumber: 'auto draft',
    paymentMethod: 'Auto Draft',
    payDate: '2025-07-14',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-013',
    name: 'Entergy: Lights and fee 3255 Choctaw location',
    amount: 286.59,
    mainCategory: 'Operating Services',
    subCategory: 'Facility Rent/Utilities (Pro Rata)',
    vendor: '',
    description: 'Entergy: Lights and fee 3255 Choctaw location',
    referenceNumber: 'debit card',
    paymentMethod: 'Debit Card',
    payDate: '2025-07-16',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-014',
    name: 'Intuit: Leah Harrison payroll',
    amount: 1506.67,
    mainCategory: 'Gross Salaries',
    subCategory: '',
    vendor: '',
    description: 'Intuit: Leah Harrison payroll',
    referenceNumber: 'auto draft',
    paymentMethod: 'Auto Draft',
    payDate: '2025-07-18',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-015',
    name: 'Intuit: Levar Robinson payroll',
    amount: 2494.14,
    mainCategory: 'Gross Salaries',
    subCategory: '',
    vendor: '',
    description: 'Intuit: Levar Robinson payroll',
    referenceNumber: 'auto draft',
    paymentMethod: 'Auto Draft',
    payDate: '2025-07-18',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-016',
    name: 'Robin Pinkston: Case Worker',
    amount: 1344.0,
    mainCategory: 'Professional Services',
    subCategory: 'Case Manager Support Contractor (Direct Workforce Support)',
    vendor: 'Case Manager Support Contractor (Direct Workforce Support)',
    description: 'Robin Pinkston: Case Worker',
    referenceNumber: 'Check #702',
    paymentMethod: 'Check',
    payDate: '2025-07-18',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-017',
    name: 'Blue Cross Blue Shield LA: Medical Insurance',
    amount: 1836.62,
    mainCategory: 'Related Benefits',
    subCategory: '',
    vendor: '',
    description: 'Blue Cross Blue Shield LA: Medical Insurance',
    referenceNumber: 'auto draft',
    paymentMethod: 'Auto Draft',
    payDate: '2025-07-21',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-018',
    name: 'Lawrence Morgan: Case Worker',
    amount: 600.0,
    mainCategory: 'Professional Services',
    subCategory: 'Case Manager Support Contractor (Direct Workforce Support)',
    vendor: 'Case Manager Support Contractor (Direct Workforce Support)',
    description: 'Lawrence Morgan: Case Worker',
    referenceNumber: 'Check #700',
    paymentMethod: 'Check',
    payDate: '2025-07-21',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-019',
    name: 'Voices of Choices: Case Manager',
    amount: 1932.0,
    mainCategory: 'Professional Services',
    subCategory: 'Case Manager Support Contractor (Direct Workforce Support)',
    vendor: 'Case Manager Support Contractor (Direct Workforce Support)',
    description: 'Voices of Choices: Case Manager',
    referenceNumber: 'Check #703',
    paymentMethod: 'Check',
    payDate: '2025-07-21',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-020',
    name: 'Rent: FYSC 1120 Government Street',
    amount: 1000.0,
    mainCategory: 'Operating Services',
    subCategory: 'Facility Rent/Utilities (Pro Rata)',
    vendor: '',
    description: 'Rent: FYSC 1120 Government Street',
    referenceNumber: 'Check #221',
    paymentMethod: 'Check',
    payDate: '2025-07-22',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-021',
    name: 'Webflow: Website Provider',
    amount: 32.05,
    mainCategory: 'Operating Services',
    subCategory: 'Outreach & Marketing (Digital/Radio)',
    vendor: '',
    description: 'Webflow: Website Provider',
    referenceNumber: 'debit card',
    paymentMethod: 'Debit Card',
    payDate: '2025-07-28',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-022',
    name: 'Luster Group: Rent 3255 Choctaw location',
    amount: 1000.0,
    mainCategory: 'Operating Services',
    subCategory: 'Facility Rent/Utilities (Pro Rata)',
    vendor: '',
    description: 'Luster Group: Rent 3255 Choctaw location',
    referenceNumber: 'Check #222',
    paymentMethod: 'Check',
    payDate: '2025-08-01',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-023',
    name: 'Robin Pinkston: Case Worker',
    amount: 1134.0,
    mainCategory: 'Professional Services',
    subCategory: 'Case Manager Support Contractor (Direct Workforce Support)',
    vendor: 'Case Manager Support Contractor (Direct Workforce Support)',
    description: 'Robin Pinkston: Case Worker',
    referenceNumber: 'Check #229',
    paymentMethod: 'Check',
    payDate: '2025-08-01',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-024',
    name: 'Intuit: Leah Harrison payroll',
    amount: 1506.67,
    mainCategory: 'Gross Salaries',
    subCategory: '',
    vendor: '',
    description: 'Intuit: Leah Harrison payroll',
    referenceNumber: 'auto draft',
    paymentMethod: 'Auto Draft',
    payDate: '2025-08-01',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-025',
    name: 'Intuit: Levar Robinson payroll',
    amount: 2494.15,
    mainCategory: 'Gross Salaries',
    subCategory: '',
    vendor: '',
    description: 'Intuit: Levar Robinson payroll',
    referenceNumber: 'auto draft',
    paymentMethod: 'Auto Draft',
    payDate: '2025-08-01',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-026',
    name: 'Quickbooks: Software',
    amount: 118.79,
    mainCategory: 'Operating Services',
    subCategory: 'Software Subscriptions',
    vendor: '',
    description: 'Quickbooks: Software',
    referenceNumber: 'debit card',
    paymentMethod: 'Debit Card',
    payDate: '2025-08-04',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-027',
    name: 'Lawrence Morgan: Case Worker',
    amount: 1200.0,
    mainCategory: 'Professional Services',
    subCategory: 'Case Manager Support Contractor (Direct Workforce Support)',
    vendor: 'Case Manager Support Contractor (Direct Workforce Support)',
    description: 'Lawrence Morgan: Case Worker',
    referenceNumber: 'Check #227',
    paymentMethod: 'Check',
    payDate: '2025-08-04',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-028',
    name: 'Voices of Choices: Case Manager',
    amount: 2716.0,
    mainCategory: 'Professional Services',
    subCategory: 'Case Manager Support Contractor (Direct Workforce Support)',
    vendor: 'Case Manager Support Contractor (Direct Workforce Support)',
    description: 'Voices of Choices: Case Manager',
    referenceNumber: 'Check #228',
    paymentMethod: 'Check',
    payDate: '2025-08-04',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-029',
    name: 'Beam:  Dental Insurance',
    amount: 24.56,
    mainCategory: 'Related Benefits',
    subCategory: '',
    vendor: '',
    description: 'Beam:  Dental Insurance',
    referenceNumber: 'auto draft',
    paymentMethod: 'Auto Draft',
    payDate: '2025-08-05',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-030',
    name: 'Circle K - gas',
    amount: 72.88,
    mainCategory: 'Operating Services',
    subCategory: 'Fuel & Vehicle Ops',
    vendor: '',
    description: 'Circle K - gas',
    referenceNumber: 'debit card',
    paymentMethod: 'Debit Card',
    payDate: '2025-08-06',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-031',
    name: 'Qrcode - Mentimeter Pro Stockho',
    amount: 324.0,
    mainCategory: 'Operating Services',
    subCategory: 'Software Subscriptions',
    vendor: '',
    description: 'Qrcode - Mentimeter Pro Stockho',
    referenceNumber: 'debit card',
    paymentMethod: 'Debit Card',
    payDate: '2025-08-07',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-032',
    name: 'CPA - Accounting',
    amount: 850.0,
    mainCategory: 'Professional Services',
    subCategory: 'Kidder & Schultz CPAs (Accounting & Payroll)',
    vendor: 'Kidder & Schultz CPAs (Accounting & Payroll)',
    description: 'CPA - Accounting',
    referenceNumber: 'debit card',
    paymentMethod: 'Debit Card',
    payDate: '2025-08-11',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-033',
    name: 'Entergy: Lights and fee 3255 Choctaw location',
    amount: 294.65,
    mainCategory: 'Operating Services',
    subCategory: 'Facility Rent/Utilities (Pro Rata)',
    vendor: '',
    description: 'Entergy: Lights and fee 3255 Choctaw location',
    referenceNumber: 'debit card',
    paymentMethod: 'Debit Card',
    payDate: '2025-08-12',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-034',
    name: 'Rent: FYSC 1120 Government Street',
    amount: 1000.0,
    mainCategory: 'Operating Services',
    subCategory: 'Facility Rent/Utilities (Pro Rata)',
    vendor: '',
    description: 'Rent: FYSC 1120 Government Street',
    referenceNumber: 'Check #231',
    paymentMethod: 'Check',
    payDate: '2025-08-12',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-035',
    name: 'Paw Professional: copier 1120 Government location',
    amount: 162.98,
    mainCategory: 'Operating Services',
    subCategory: 'Printing & Copying',
    vendor: '',
    description: 'Paw Professional: copier 1120 Government location',
    referenceNumber: 'debit card',
    paymentMethod: 'Debit Card',
    payDate: '2025-08-13',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-036',
    name: 'Marketing: Smartlite',
    amount: 1085.0,
    mainCategory: 'Operating Services',
    subCategory: 'Outreach & Marketing (Digital/Radio)',
    vendor: '',
    description: 'Marketing: Smartlite',
    referenceNumber: 'debit card',
    paymentMethod: 'Debit Card',
    payDate: '2025-08-13',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-037',
    name: 'AmTrust: Workers Comp, Liability Insurance',
    amount: 149.5,
    mainCategory: 'Related Benefits',
    subCategory: '',
    vendor: '',
    description: 'AmTrust: Workers Comp, Liability Insurance',
    referenceNumber: 'auto draft',
    paymentMethod: 'Auto Draft',
    payDate: '2025-08-13',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-038',
    name: 'AmTrust: Workers Comp, Liability Insurance',
    amount: 195.0,
    mainCategory: 'Related Benefits',
    subCategory: '',
    vendor: '',
    description: 'AmTrust: Workers Comp, Liability Insurance',
    referenceNumber: 'auto draft',
    paymentMethod: 'Auto Draft',
    payDate: '2025-08-13',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-039',
    name: 'Tmobile: Cell phone',
    amount: 156.0,
    mainCategory: 'Operating Services',
    subCategory: 'Internet & Telecom',
    vendor: '',
    description: 'Tmobile: Cell phone',
    referenceNumber: 'debit card',
    paymentMethod: 'Debit Card',
    payDate: '2025-08-15',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-040',
    name: 'Tmobile: Cell phone',
    amount: 183.8,
    mainCategory: 'Operating Services',
    subCategory: 'Internet & Telecom',
    vendor: '',
    description: 'Tmobile: Cell phone',
    referenceNumber: 'debit card',
    paymentMethod: 'Debit Card',
    payDate: '2025-08-15',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-041',
    name: 'Intuit: Leah Harrison payroll',
    amount: 1506.67,
    mainCategory: 'Gross Salaries',
    subCategory: '',
    vendor: '',
    description: 'Intuit: Leah Harrison payroll',
    referenceNumber: 'auto draft',
    paymentMethod: 'Auto Draft',
    payDate: '2025-08-15',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-042',
    name: 'Intuit: Levar Robinson payroll',
    amount: 2494.15,
    mainCategory: 'Gross Salaries',
    subCategory: '',
    vendor: '',
    description: 'Intuit: Levar Robinson payroll',
    referenceNumber: 'auto draft',
    paymentMethod: 'Auto Draft',
    payDate: '2025-08-15',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-043',
    name: 'Robin Pinkston: Case Worker',
    amount: 1344.0,
    mainCategory: 'Professional Services',
    subCategory: 'Case Manager Support Contractor (Direct Workforce Support)',
    vendor: 'Case Manager Support Contractor (Direct Workforce Support)',
    description: 'Robin Pinkston: Case Worker',
    referenceNumber: 'auto draft',
    paymentMethod: 'Auto Draft',
    payDate: '2025-08-15',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-044',
    name: 'Lawrence Morgan: Case Worker',
    amount: 1200.0,
    mainCategory: 'Professional Services',
    subCategory: 'Case Manager Support Contractor (Direct Workforce Support)',
    vendor: 'Case Manager Support Contractor (Direct Workforce Support)',
    description: 'Lawrence Morgan: Case Worker',
    referenceNumber: 'Check #705',
    paymentMethod: 'Check',
    payDate: '2025-08-18',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-045',
    name: 'Voices of Choices: Case Manager',
    amount: 2030.0,
    mainCategory: 'Professional Services',
    subCategory: 'Case Manager Support Contractor (Direct Workforce Support)',
    vendor: 'Case Manager Support Contractor (Direct Workforce Support)',
    description: 'Voices of Choices: Case Manager',
    referenceNumber: 'Check #706',
    paymentMethod: 'Check',
    payDate: '2025-08-18',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-046',
    name: 'Cox Cable: Internet 3255 Choctaw location',
    amount: 219.26,
    mainCategory: 'Operating Services',
    subCategory: 'Internet & Telecom',
    vendor: '',
    description: 'Cox Cable: Internet 3255 Choctaw location',
    referenceNumber: 'auto draft',
    paymentMethod: 'Auto Draft',
    payDate: '2025-08-20',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-047',
    name: 'Circle K - gas',
    amount: 73.48,
    mainCategory: 'Operating Services',
    subCategory: 'Fuel & Vehicle Ops',
    vendor: '',
    description: 'Circle K - gas',
    referenceNumber: 'debit card',
    paymentMethod: 'Debit Card',
    payDate: '2025-08-25',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-048',
    name: 'Quickbooks: Software',
    amount: 118.79,
    mainCategory: 'Operating Services',
    subCategory: 'Software Subscriptions',
    vendor: '',
    description: 'Quickbooks: Software',
    referenceNumber: 'debit card',
    paymentMethod: 'Debit Card',
    payDate: '2025-08-25',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-049',
    name: 'Webflow: Website Provider',
    amount: 32.05,
    mainCategory: 'Operating Services',
    subCategory: 'Outreach & Marketing (Digital/Radio)',
    vendor: '',
    description: 'Webflow: Website Provider',
    referenceNumber: 'debit card',
    paymentMethod: 'Debit Card',
    payDate: '2025-08-26',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-050',
    name: 'Intuit: Leah Harrison payroll',
    amount: 1506.67,
    mainCategory: 'Gross Salaries',
    subCategory: '',
    vendor: '',
    description: 'Intuit: Leah Harrison payroll',
    referenceNumber: 'auto draft',
    paymentMethod: 'Auto Draft',
    payDate: '2025-08-29',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-051',
    name: 'Intuit: Levar Robinson payroll',
    amount: 2494.14,
    mainCategory: 'Gross Salaries',
    subCategory: '',
    vendor: '',
    description: 'Intuit: Levar Robinson payroll',
    referenceNumber: 'auto draft',
    paymentMethod: 'Auto Draft',
    payDate: '2025-08-29',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-052',
    name: 'Robin Pinkston: Case Worker',
    amount: 1280.0,
    mainCategory: 'Professional Services',
    subCategory: 'Case Manager Support Contractor (Direct Workforce Support)',
    vendor: 'Case Manager Support Contractor (Direct Workforce Support)',
    description: 'Robin Pinkston: Case Worker',
    referenceNumber: 'Check #709',
    paymentMethod: 'Check',
    payDate: '2025-08-29',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-053',
    name: 'Training in New Orleans - Parking cost',
    amount: 210.18,
    mainCategory: 'Travel',
    subCategory: '',
    vendor: '',
    description: 'Training in New Orleans - Parking cost',
    referenceNumber: 'debit card',
    paymentMethod: 'Debit Card',
    payDate: '2025-08-29',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-054',
    name: 'Circle K - gas',
    amount: 70.1,
    mainCategory: 'Operating Services',
    subCategory: 'Fuel & Vehicle Ops',
    vendor: '',
    description: 'Circle K - gas',
    referenceNumber: 'debit card',
    paymentMethod: 'Debit Card',
    payDate: '2025-09-02',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-055',
    name: 'Blue Cross Blue Shield LA: Medical Insurance',
    amount: 3673.24,
    mainCategory: 'Related Benefits',
    subCategory: '',
    vendor: '',
    description: 'Blue Cross Blue Shield LA: Medical Insurance',
    referenceNumber: 'auto draft',
    paymentMethod: 'Auto Draft',
    payDate: '2025-09-02',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-056',
    name: 'Voices of Choices: Case Manager',
    amount: 2058.0,
    mainCategory: 'Professional Services',
    subCategory: 'Case Manager Support Contractor (Direct Workforce Support)',
    vendor: 'Case Manager Support Contractor (Direct Workforce Support)',
    description: 'Voices of Choices: Case Manager',
    referenceNumber: 'Check #710',
    paymentMethod: 'Check',
    payDate: '2025-09-02',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-057',
    name: 'Lawrence Morgan: Case Worker',
    amount: 1200.0,
    mainCategory: 'Professional Services',
    subCategory: 'Case Manager Support Contractor (Direct Workforce Support)',
    vendor: 'Case Manager Support Contractor (Direct Workforce Support)',
    description: 'Lawrence Morgan: Case Worker',
    referenceNumber: 'Check #711',
    paymentMethod: 'Check',
    payDate: '2025-09-02',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-058',
    name: 'Rent: FYSC 1120 Government Street',
    amount: 1000.0,
    mainCategory: 'Operating Services',
    subCategory: 'Facility Rent/Utilities (Pro Rata)',
    vendor: '',
    description: 'Rent: FYSC 1120 Government Street',
    referenceNumber: 'Check #713',
    paymentMethod: 'Check',
    payDate: '2025-09-03',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-059',
    name: 'Beam:  Dental Insurance',
    amount: 24.56,
    mainCategory: 'Related Benefits',
    subCategory: '',
    vendor: '',
    description: 'Beam:  Dental Insurance',
    referenceNumber: 'auto draft',
    paymentMethod: 'Auto Draft',
    payDate: '2025-09-04',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-060',
    name: 'AmTrust: Workers Comp, Liability Insurance',
    amount: 2058.0,
    mainCategory: 'Related Benefits',
    subCategory: '',
    vendor: '',
    description: 'AmTrust: Workers Comp, Liability Insurance',
    referenceNumber: 'auto draft',
    paymentMethod: 'Auto Draft',
    payDate: '2025-09-04',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-061',
    name: 'Robin Pinkston: Case Worker',
    amount: 68.9,
    mainCategory: 'Professional Services',
    subCategory: 'Case Manager Support Contractor (Direct Workforce Support)',
    vendor: 'Case Manager Support Contractor (Direct Workforce Support)',
    description: 'Robin Pinkston: Case Worker',
    referenceNumber: 'Check #712',
    paymentMethod: 'Check',
    payDate: '2025-09-04',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-062',
    name: 'Circle K - gas',
    amount: 70.52,
    mainCategory: 'Operating Services',
    subCategory: 'Fuel & Vehicle Ops',
    vendor: '',
    description: 'Circle K - gas',
    referenceNumber: 'debit card',
    paymentMethod: 'Debit Card',
    payDate: '2025-09-08',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-063',
    name: 'CPA - Accounting',
    amount: 600.0,
    mainCategory: 'Professional Services',
    subCategory: 'Kidder & Schultz CPAs (Accounting & Payroll)',
    vendor: 'Kidder & Schultz CPAs (Accounting & Payroll)',
    description: 'CPA - Accounting',
    referenceNumber: 'auto draft',
    paymentMethod: 'Auto Draft',
    payDate: '2025-09-09',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-064',
    name: 'Luster Group: Rent 3255 Choctaw location',
    amount: 1000.0,
    mainCategory: 'Operating Services',
    subCategory: 'Facility Rent/Utilities (Pro Rata)',
    vendor: '',
    description: 'Luster Group: Rent 3255 Choctaw location',
    referenceNumber: 'Check #714',
    paymentMethod: 'Check',
    payDate: '2025-09-09',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-065',
    name: 'AmTrust: Workers Comp, Liability Insurance',
    amount: 390.0,
    mainCategory: 'Related Benefits',
    subCategory: '',
    vendor: '',
    description: 'AmTrust: Workers Comp, Liability Insurance',
    referenceNumber: 'auto draft',
    paymentMethod: 'Auto Draft',
    payDate: '2025-09-10',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-066',
    name: 'AmTrust: Workers Comp, Liability Insurance',
    amount: 428.5,
    mainCategory: 'Related Benefits',
    subCategory: '',
    vendor: '',
    description: 'AmTrust: Workers Comp, Liability Insurance',
    referenceNumber: 'auto draft',
    paymentMethod: 'Auto Draft',
    payDate: '2025-09-10',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-067',
    name: 'Intuit: Leah Harrison payroll',
    amount: 1506.67,
    mainCategory: 'Gross Salaries',
    subCategory: '',
    vendor: '',
    description: 'Intuit: Leah Harrison payroll',
    referenceNumber: 'auto draft',
    paymentMethod: 'Auto Draft',
    payDate: '2025-09-12',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-068',
    name: 'Intuit: Levar Robinson payroll',
    amount: 2494.15,
    mainCategory: 'Gross Salaries',
    subCategory: '',
    vendor: '',
    description: 'Intuit: Levar Robinson payroll',
    referenceNumber: 'auto draft',
    paymentMethod: 'Auto Draft',
    payDate: '2025-09-12',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-069',
    name: 'Robin Pinkston: Case Worker',
    amount: 1239.0,
    mainCategory: 'Professional Services',
    subCategory: 'Case Manager Support Contractor (Direct Workforce Support)',
    vendor: 'Case Manager Support Contractor (Direct Workforce Support)',
    description: 'Robin Pinkston: Case Worker',
    referenceNumber: 'Check #721',
    paymentMethod: 'Check',
    payDate: '2025-09-12',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-070',
    name: 'Lawrence Morgan: Case Worker',
    amount: 1080.0,
    mainCategory: 'Professional Services',
    subCategory: 'Case Manager Support Contractor (Direct Workforce Support)',
    vendor: 'Case Manager Support Contractor (Direct Workforce Support)',
    description: 'Lawrence Morgan: Case Worker',
    referenceNumber: 'Check #720',
    paymentMethod: 'Check',
    payDate: '2025-09-15',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-071',
    name: 'Paw Professional: copier 1120 Government location',
    amount: 81.49,
    mainCategory: 'Operating Services',
    subCategory: 'Printing & Copying',
    vendor: '',
    description: 'Paw Professional: copier 1120 Government location',
    referenceNumber: 'debit card',
    paymentMethod: 'Debit Card',
    payDate: '2025-09-15',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-072',
    name: 'Voices of Choices: Case Manager',
    amount: 1946.0,
    mainCategory: 'Professional Services',
    subCategory: 'Case Manager Support Contractor (Direct Workforce Support)',
    vendor: 'Case Manager Support Contractor (Direct Workforce Support)',
    description: 'Voices of Choices: Case Manager',
    referenceNumber: 'Check #715',
    paymentMethod: 'Check',
    payDate: '2025-09-18',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-073',
    name: 'Tmobile: Cell phone',
    amount: 156.0,
    mainCategory: 'Operating Services',
    subCategory: 'Internet & Telecom',
    vendor: '',
    description: 'Tmobile: Cell phone',
    referenceNumber: 'debit card',
    paymentMethod: 'Debit Card',
    payDate: '2025-09-22',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-074',
    name: 'Allianz: Insurance',
    amount: 22.0,
    mainCategory: 'Related Benefits',
    subCategory: '',
    vendor: '',
    description: 'Allianz: Insurance',
    referenceNumber: 'debit card',
    paymentMethod: 'Debit Card',
    payDate: '2025-09-22',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-075',
    name: 'Webflow: Website Provider',
    amount: 32.05,
    mainCategory: 'Operating Services',
    subCategory: 'Outreach & Marketing (Digital/Radio)',
    vendor: '',
    description: 'Webflow: Website Provider',
    referenceNumber: 'debit card',
    paymentMethod: 'Debit Card',
    payDate: '2025-09-26',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-076',
    name: 'Intuit: Leah Harrison payroll',
    amount: 1506.67,
    mainCategory: 'Gross Salaries',
    subCategory: '',
    vendor: '',
    description: 'Intuit: Leah Harrison payroll',
    referenceNumber: 'auto draft',
    paymentMethod: 'Auto Draft',
    payDate: '2025-09-26',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-077',
    name: 'Intuit: Levar Robinson payroll',
    amount: 2494.14,
    mainCategory: 'Gross Salaries',
    subCategory: '',
    vendor: '',
    description: 'Intuit: Levar Robinson payroll',
    referenceNumber: 'auto draft',
    paymentMethod: 'Auto Draft',
    payDate: '2025-09-26',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-078',
    name: 'Robin Pinkston: Case Worker',
    amount: 1176.0,
    mainCategory: 'Professional Services',
    subCategory: 'Case Manager Support Contractor (Direct Workforce Support)',
    vendor: 'Case Manager Support Contractor (Direct Workforce Support)',
    description: 'Robin Pinkston: Case Worker',
    referenceNumber: 'Check #718',
    paymentMethod: 'Check',
    payDate: '2025-09-26',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-079',
    name: 'Quickbooks: Software',
    amount: 118.79,
    mainCategory: 'Operating Services',
    subCategory: 'Software Subscriptions',
    vendor: '',
    description: 'Quickbooks: Software',
    referenceNumber: 'debit card',
    paymentMethod: 'Debit Card',
    payDate: '2025-09-29',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-080',
    name: 'Lawrence Morgan: Case Worker',
    amount: 1200.0,
    mainCategory: 'Professional Services',
    subCategory: 'Case Manager Support Contractor (Direct Workforce Support)',
    vendor: 'Case Manager Support Contractor (Direct Workforce Support)',
    description: 'Lawrence Morgan: Case Worker',
    referenceNumber: 'Check #716',
    paymentMethod: 'Check',
    payDate: '2025-09-29',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-081',
    name: 'Voices of Choices: Case Manager',
    amount: 644.0,
    mainCategory: 'Professional Services',
    subCategory: 'Case Manager Support Contractor (Direct Workforce Support)',
    vendor: 'Case Manager Support Contractor (Direct Workforce Support)',
    description: 'Voices of Choices: Case Manager',
    referenceNumber: 'Check #717',
    paymentMethod: 'Check',
    payDate: '2025-09-29',
    quarter: 'Q3',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-082',
    name: 'Entergy: Lights and fee 3255 Choctaw location',
    amount: 301.73,
    mainCategory: 'Operating Services',
    subCategory: 'Facility Rent/Utilities (Pro Rata)',
    vendor: '',
    description: 'Entergy: Lights and fee 3255 Choctaw location',
    referenceNumber: 'debit card',
    paymentMethod: 'Debit Card',
    payDate: '2025-10-01',
    quarter: 'Q4',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-083',
    name: 'Entergy: Lights and fee 3255 Choctaw location',
    amount: 281.87,
    mainCategory: 'Operating Services',
    subCategory: 'Facility Rent/Utilities (Pro Rata)',
    vendor: '',
    description: 'Entergy: Lights and fee 3255 Choctaw location',
    referenceNumber: 'debit card',
    paymentMethod: 'Debit Card',
    payDate: '2025-10-03',
    quarter: 'Q4',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-084',
    name: 'Circle K - gas',
    amount: 59.65,
    mainCategory: 'Operating Services',
    subCategory: 'Fuel & Vehicle Ops',
    vendor: '',
    description: 'Circle K - gas',
    referenceNumber: 'debit card',
    paymentMethod: 'Debit Card',
    payDate: '2025-10-06',
    quarter: 'Q4',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-085',
    name: 'Postage: USPS',
    amount: 19.5,
    mainCategory: 'Other Charges',
    subCategory: '',
    vendor: '',
    description: 'Postage: USPS',
    referenceNumber: 'debit card',
    paymentMethod: 'Debit Card',
    payDate: '2025-10-07',
    quarter: 'Q4',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-086',
    name: 'Circle K - gas',
    amount: 56.57,
    mainCategory: 'Operating Services',
    subCategory: 'Fuel & Vehicle Ops',
    vendor: '',
    description: 'Circle K - gas',
    referenceNumber: 'debit card',
    paymentMethod: 'Debit Card',
    payDate: '2025-10-10',
    quarter: 'Q4',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-087',
    name: 'Intuit: Leah Harrison payroll',
    amount: 1506.67,
    mainCategory: 'Gross Salaries',
    subCategory: '',
    vendor: '',
    description: 'Intuit: Leah Harrison payroll',
    referenceNumber: 'auto draft',
    paymentMethod: 'Auto Draft',
    payDate: '2025-10-10',
    quarter: 'Q4',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-088',
    name: 'Intuit: Levar Robinson payroll',
    amount: 2494.15,
    mainCategory: 'Gross Salaries',
    subCategory: '',
    vendor: '',
    description: 'Intuit: Levar Robinson payroll',
    referenceNumber: 'auto draft',
    paymentMethod: 'Auto Draft',
    payDate: '2025-10-10',
    quarter: 'Q4',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-089',
    name: 'Robin Pinkston: Case Worker',
    amount: 1344.0,
    mainCategory: 'Professional Services',
    subCategory: 'Case Manager Support Contractor (Direct Workforce Support)',
    vendor: 'Case Manager Support Contractor (Direct Workforce Support)',
    description: 'Robin Pinkston: Case Worker',
    referenceNumber: 'Check #233',
    paymentMethod: 'Check',
    payDate: '2025-10-21',
    quarter: 'Q4',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-090',
    name: 'Tmobile: Cell phone',
    amount: 156.0,
    mainCategory: 'Operating Services',
    subCategory: '',
    vendor: '',
    description: 'Tmobile: Cell phone',
    referenceNumber: 'debit card',
    paymentMethod: 'Debit Card',
    payDate: '2025-10-22',
    quarter: 'Q4',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-091',
    name: 'Voices of Choices: Case Manager',
    amount: 2002.0,
    mainCategory: 'Professional Services',
    subCategory: 'Case Manager Support Contractor (Direct Workforce Support)',
    vendor: 'Case Manager Support Contractor (Direct Workforce Support)',
    description: 'Voices of Choices: Case Manager',
    referenceNumber: 'Check #234',
    paymentMethod: 'Check',
    payDate: '2025-10-22',
    quarter: 'Q4',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-092',
    name: 'Lawrence Morgan: Case Worker',
    amount: 1080.0,
    mainCategory: 'Professional Services',
    subCategory: 'Case Manager Support Contractor (Direct Workforce Support)',
    vendor: 'Case Manager Support Contractor (Direct Workforce Support)',
    description: 'Lawrence Morgan: Case Worker',
    referenceNumber: 'Check #235',
    paymentMethod: 'Check',
    payDate: '2025-10-22',
    quarter: 'Q4',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-093',
    name: 'Walmart',
    amount: 192.87,
    mainCategory: 'Operating Services',
    subCategory: 'Training Materials & Curricula',
    vendor: '',
    description: 'Walmart',
    referenceNumber: 'debit card',
    paymentMethod: 'Debit Card',
    payDate: '2025-10-23',
    quarter: 'Q4',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-094',
    name: 'Quickbooks: Software',
    amount: 97.24,
    mainCategory: 'Operating Services',
    subCategory: 'Software Subscriptions',
    vendor: '',
    description: 'Quickbooks: Software',
    referenceNumber: 'auto draft',
    paymentMethod: 'Auto Draft',
    payDate: '2025-10-24',
    quarter: 'Q4',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-095',
    name: 'Webflow: Website Provider',
    amount: 32.05,
    mainCategory: 'Operating Services',
    subCategory: 'Outreach & Marketing (Digital/Radio)',
    vendor: '',
    description: 'Webflow: Website Provider',
    referenceNumber: 'debit card',
    paymentMethod: 'Debit Card',
    payDate: '2025-10-27',
    quarter: 'Q4',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-096',
    name: 'Office Depot',
    amount: 106.06,
    mainCategory: 'Operating Services',
    subCategory: 'Office Supplies',
    vendor: '',
    description: 'Office Depot',
    referenceNumber: 'debit card',
    paymentMethod: 'Debit Card',
    payDate: '2025-10-27',
    quarter: 'Q4',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-097',
    name: 'Marketing: Smartlite',
    amount: 395.0,
    mainCategory: 'Operating Services',
    subCategory: 'Outreach & Marketing (Digital/Radio)',
    vendor: '',
    description: 'Marketing: Smartlite',
    referenceNumber: 'debit card',
    paymentMethod: 'Debit Card',
    payDate: '2025-10-28',
    quarter: 'Q4',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-098',
    name: 'Blue Cross Blue Shield LA: Medical Insurance',
    amount: 1836.62,
    mainCategory: 'Related Benefits',
    subCategory: '',
    vendor: '',
    description: 'Blue Cross Blue Shield LA: Medical Insurance',
    referenceNumber: 'auto draft',
    paymentMethod: 'Auto Draft',
    payDate: '2025-10-28',
    quarter: 'Q4',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-099',
    name: 'Beam:  Dental Insurance',
    amount: 24.56,
    mainCategory: 'Related Benefits',
    subCategory: '',
    vendor: '',
    description: 'Beam:  Dental Insurance',
    referenceNumber: 'auto draft',
    paymentMethod: 'Auto Draft',
    payDate: '2025-11-04',
    quarter: 'Q4',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-100',
    name: 'Office Depot',
    amount: 140.82,
    mainCategory: 'Operating Services',
    subCategory: 'Office Supplies',
    vendor: '',
    description: 'Office Depot',
    referenceNumber: 'debit card',
    paymentMethod: 'Debit Card',
    payDate: '2025-11-06',
    quarter: 'Q4',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-101',
    name: 'Circle K - gas',
    amount: 51.38,
    mainCategory: 'Operating Services',
    subCategory: 'Fuel & Vehicle Ops',
    vendor: '',
    description: 'Circle K - gas',
    referenceNumber: 'debit card',
    paymentMethod: 'Debit Card',
    payDate: '2025-11-07',
    quarter: 'Q4',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-102',
    name: 'Hotfax: Event ',
    amount: 208.0,
    mainCategory: 'Other Charges',
    subCategory: '',
    vendor: '',
    description: 'Hotfax: Event ',
    referenceNumber: 'debit card',
    paymentMethod: 'Debit Card',
    payDate: '2025-11-12',
    quarter: 'Q4',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-103',
    name: 'Cox Cable: Internet 3255 Choctaw location',
    amount: 414.89,
    mainCategory: 'Operating Services',
    subCategory: 'Internet & Telecom',
    vendor: '',
    description: 'Cox Cable: Internet 3255 Choctaw location',
    referenceNumber: 'auto draft',
    paymentMethod: 'Auto Draft',
    payDate: '2025-11-12',
    quarter: 'Q4',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-104',
    name: 'CPA - Accounting',
    amount: 600.0,
    mainCategory: 'Professional Services',
    subCategory: 'Kidder & Schultz CPAs (Accounting & Payroll)',
    vendor: 'Kidder & Schultz CPAs (Accounting & Payroll)',
    description: 'CPA - Accounting',
    referenceNumber: 'auto draft',
    paymentMethod: 'Auto Draft',
    payDate: '2025-11-12',
    quarter: 'Q4',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-105',
    name: 'Blue Cross Blue Shield LA: Medical Insurance',
    amount: 1836.62,
    mainCategory: 'Related Benefits',
    subCategory: '',
    vendor: '',
    description: 'Blue Cross Blue Shield LA: Medical Insurance',
    referenceNumber: 'auto draft',
    paymentMethod: 'Auto Draft',
    payDate: '2025-11-12',
    quarter: 'Q4',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-106',
    name: 'Intuit: Levar Robinson payroll',
    amount: 2494.14,
    mainCategory: 'Gross Salaries',
    subCategory: '',
    vendor: '',
    description: 'Intuit: Levar Robinson payroll',
    referenceNumber: 'auto draft',
    paymentMethod: 'Auto Draft',
    payDate: '2025-11-12',
    quarter: 'Q4',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-107',
    name: 'Intuit: Levar Robinson payroll',
    amount: 2494.15,
    mainCategory: 'Gross Salaries',
    subCategory: '',
    vendor: '',
    description: 'Intuit: Levar Robinson payroll',
    referenceNumber: 'auto draft',
    paymentMethod: 'Auto Draft',
    payDate: '2025-11-12',
    quarter: 'Q4',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-108',
    name: 'Rent: FYSC 1120 Government Street',
    amount: 1000.0,
    mainCategory: 'Operating Services',
    subCategory: 'Facility Rent/Utilities (Pro Rata)',
    vendor: '',
    description: 'Rent: FYSC 1120 Government Street',
    referenceNumber: 'Check #726',
    paymentMethod: 'Check',
    payDate: '2025-11-12',
    quarter: 'Q4',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-109',
    name: 'Luster Group: Rent 3255 Choctaw location',
    amount: 1000.0,
    mainCategory: 'Operating Services',
    subCategory: 'Facility Rent/Utilities (Pro Rata)',
    vendor: '',
    description: 'Luster Group: Rent 3255 Choctaw location',
    referenceNumber: 'Check #727',
    paymentMethod: 'Check',
    payDate: '2025-11-13',
    quarter: 'Q4',
    year: 2025,
    funder: 'Act 461 Treasury'
  },
  {
    id: 'treasury-110',
    name: 'Luster Group: Rent 3255 Choctaw location',
    amount: 1000.0,
    mainCategory: 'Operating Services',
    subCategory: 'Facility Rent/Utilities (Pro Rata)',
    vendor: '',
    description: 'Luster Group: Rent 3255 Choctaw location',
    referenceNumber: 'Check #728',
    paymentMethod: 'Check',
    payDate: '2025-11-13',
    quarter: 'Q4',
    year: 2025,
    funder: 'Act 461 Treasury'
  }
];

type AppView = 'hub' | 'training' | 'tracking' | 'admin' | 'casemanager' | 'finance' | 'manual' | 'assessment' | 'progress' | 'checkin';
type FinanceSubView = 'dashboard' | 'exchange' | 'bills' | 'reports' | 'multifunder';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [isTrainingAuthenticated, setIsTrainingAuthenticated] = useState(false);
  const [trainingTrackSelected, setTrainingTrackSelected] = useState<TrainingTrack | null>(null);
  const [isFinanceAuthenticated, setIsFinanceAuthenticated] = useState(false);
  
  const [currentView, setCurrentView] = useState<AppView>('hub');
  const [financeSubView, setFinanceSubView] = useState<FinanceSubView>('dashboard');
  const [activeModuleId, setActiveModuleId] = useState<ModuleType>(ModuleType.FOUNDATIONAL);
  const [activeTrack, setActiveTrack] = useState<TrainingTrack>('case_manager');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  
  // Initialize with pre-loaded Treasury data
  const [allFinanceEntries, setAllFinanceEntries] = useState<BillEntry[]>(PRELOADED_FINANCE_DATA);

  // Check URL for direct access (for fathers on mobile)
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/checkin') {
      setCurrentView('checkin');
    } else if (path === '/assessment') {
      setCurrentView('assessment');
    } else if (path === '/progress' || path === '/myprogress') {
      setCurrentView('progress');
    }
  }, []);

  const getModulesForTrack = (track: TrainingTrack) => {
    switch(track) {
      case 'facilitator': return FACILITATOR_MODULES;
      case 'board': return BOARD_MODULES;
      default: return CASE_MANAGER_MODULES;
    }
  };

  const currentModules = getModulesForTrack(activeTrack);
  const activeModuleIndex = currentModules.findIndex(m => m.id === activeModuleId);
  const activeModule = currentModules[activeModuleIndex] || currentModules[0];
  const nextModule = activeModuleIndex < currentModules.length - 1 ? currentModules[activeModuleIndex + 1] : null;

  const handleModuleChange = (id: ModuleType) => {
    setActiveModuleId(id);
    setCurrentView('training');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTrackSelect = (track: TrainingTrack) => {
    setActiveTrack(track);
    setTrainingTrackSelected(track);
    const trackModules = getModulesForTrack(track);
    setActiveModuleId(trackModules[0].id);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setIsTrainingAuthenticated(false);
    setTrainingTrackSelected(null);
    setIsFinanceAuthenticated(false);
    setCurrentView('hub');
  };

  // NEW: Check-in page - NO LOGIN REQUIRED (for fathers on mobile)
  if (currentView === 'checkin') {
    return <FatherCheckIn />;
  }

  // Assessment page - NO LOGIN REQUIRED (for fathers on mobile)
  if (currentView === 'assessment') {
    return <ClassAssessment />;
  }

  // Progress page - NO LOGIN REQUIRED (for fathers to check their progress)
  if (currentView === 'progress') {
    return <FatherProgress />;
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  if (currentView === 'training' && !isTrainingAuthenticated) {
    return <TrainingLoginPage onLogin={() => setIsTrainingAuthenticated(true)} onBack={() => setCurrentView('hub')} />;
  }

  if (currentView === 'training' && !trainingTrackSelected) {
    return <TrainingTrackSelector onSelect={handleTrackSelect} onBack={() => setCurrentView('hub')} />;
  }

  if (currentView === 'finance' && !isFinanceAuthenticated) {
    return <FinancialLoginPage onLogin={() => setIsFinanceAuthenticated(true)} onBack={() => setCurrentView('hub')} />;
  }

  if (currentView === 'hub') {
    return <Hub onNavigate={(view) => setCurrentView(view)} onLogout={handleLogout} />;
  }

  if (currentView === 'casemanager') {
    return <div className="h-screen animate-in fade-in duration-500 relative z-0 overflow-y-auto"><CaseManagerHub onClose={() => setCurrentView('hub')} /></div>;
  }

  if (currentView === 'admin') {
    return <div className="h-screen animate-in fade-in duration-500 relative z-0"><AdminPortal onClose={() => setCurrentView('hub')} /></div>;
  }

  if (currentView === 'tracking') {
    return <div className="h-screen animate-in fade-in duration-500 relative z-0 overflow-y-auto"><FatherhoodTracking onBack={() => setCurrentView('hub')} /></div>;
  }

  if (currentView === 'finance') {
    return (
      <div className="min-h-screen bg-white flex flex-col p-6 md:p-12 animate-in fade-in duration-500 overflow-y-auto">
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row md:items-center justify-between border-b pb-8 mb-12 gap-8">
           <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-[#0F2C5C] text-white rounded-2xl flex items-center justify-center shadow-xl ring-4 ring-indigo-50"><i className="fas fa-vault text-2xl"></i></div>
              <div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Financial Tools & Budgeting</h1>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-blue-600 font-black uppercase tracking-widest text-[10px] bg-blue-50 px-2 py-0.5 rounded">Restricted Access</p>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Fiscal Analytics v3.1</p>
                </div>
              </div>
           </div>
           <div className="flex items-center gap-4">
              <div className="bg-slate-50 p-1 rounded-xl flex border border-slate-100 overflow-x-auto hide-scrollbar">
                <button onClick={() => setFinanceSubView('dashboard')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${financeSubView === 'dashboard' ? 'bg-[#0F2C5C] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Analysis</button>
                <button onClick={() => setFinanceSubView('bills')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${financeSubView === 'bills' ? 'bg-[#0F2C5C] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Ledger</button>
                <button onClick={() => setFinanceSubView('reports')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${financeSubView === 'reports' ? 'bg-[#0F2C5C] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
                  <i className="fas fa-file-invoice mr-1"></i>Reports
                </button>
                <button onClick={() => setFinanceSubView('exchange')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${financeSubView === 'exchange' ? 'bg-[#0F2C5C] text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Exchange</button>
                <button onClick={() => setFinanceSubView('multifunder')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${financeSubView === 'multifunder' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
                  <i className="fas fa-hand-holding-usd mr-1"></i>Multi-Funder
                </button>
              </div>
              <button onClick={() => { setCurrentView('hub'); setFinanceSubView('dashboard'); }} className="px-6 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all whitespace-nowrap">Exit Portal</button>
           </div>
        </div>
        <div className="max-w-7xl mx-auto w-full">
           {financeSubView === 'dashboard' && <FinanceDashboard entries={allFinanceEntries} activeYear={2025} />}
           {financeSubView === 'exchange' && <DataExchange entries={allFinanceEntries} onImport={setAllFinanceEntries} />}
           {financeSubView === 'bills' && <FinanceBills entries={allFinanceEntries} onDataUpdate={setAllFinanceEntries} />}
           {financeSubView === 'reports' && <FinanceReports entries={allFinanceEntries} />}
           {financeSubView === 'multifunder' && <MultiFunderDashboard entries={allFinanceEntries} />}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <Sidebar 
        activeModuleId={activeModuleId} 
        onModuleSelect={handleModuleChange} 
        view={currentView === 'manual' ? 'manual' : 'module'} 
        onViewChange={(v) => setCurrentView(v === 'manual' ? 'manual' : 'training')} 
        onBackToHub={() => setCurrentView('hub')}
        activeTrack={activeTrack}
        onTrackSelect={handleTrackSelect}
        activeModules={currentModules}
        onChangeTrack={() => setTrainingTrackSelected(null)}
      />
      <main className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        <Header activeModule={activeModule} view={currentView === 'manual' ? 'manual' : 'module'} onToggleAssistant={() => setIsAssistantOpen(!isAssistantOpen)} />
        <div className="p-4 md:p-8 flex-1">
          {currentView === 'training' ? (
            <ModuleView 
              module={activeModule} 
              onNext={() => {
                if (nextModule) handleModuleChange(nextModule.id);
                else setCurrentView('manual');
              }}
              nextModuleTitle={nextModule?.title}
            />
          ) : <Manual onSelectModule={handleModuleChange} />}
        </div>
        <footer className="p-6 text-center text-slate-400 text-sm border-t bg-white">&copy; {new Date().getFullYear()} Fathers On A Mission (FOAM). All rights reserved.</footer>
      </main>
      <GeminiAssistant isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} context={activeModule.fullText} />
      {!isAssistantOpen && <button onClick={() => setIsAssistantOpen(true)} className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center z-50"><i className="fas fa-robot text-xl"></i></button>}
    </div>
  );
};

export default App;
