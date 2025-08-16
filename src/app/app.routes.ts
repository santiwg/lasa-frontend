import { Routes } from '@angular/router';
import { TemplatePage } from './pages/template/template-page';
import { HomePage } from './pages/home/home-page';
import { SalesPage } from './pages/sales/sales-page';
import { PurchasesPage } from './pages/purchases/purchases-page';
import { CollectionsPage } from './pages/collections/collections-page';
import { PaymentsPage } from './pages/payments/payments-page';
import { SuppliersPage } from './pages/suppliers/suppliers-page';
import { CustomersPage } from './pages/customers/customers-page';
import { ProductionPage } from './pages/production/production-page';
import { SuppliesPage } from './pages/supplies/supplies-page';
import { ProductsPage } from './pages/products/products-page';
import { EmployeesPage } from './pages/employees/employees-page';
import { CashFlowPage } from './pages/cash-flow/cash-flow-page';
import { CifPage } from './pages/cif/cif-page';

export const routes: Routes = [
  {
    path: '',
  component: TemplatePage,
    children: [
      {
        path: '',
  component: HomePage,
      },
      {
        path: 'sales',
  component: SalesPage
      },
      {
        path: 'purchases',
  component: PurchasesPage
      },
      {
        path: 'collections',
  component: CollectionsPage
      },
      {
        path: 'payments',
  component: PaymentsPage
      },
      {
        path: 'suppliers',
  component: SuppliersPage
      },
      {
        path: 'customers',
  component: CustomersPage
      },
      {
        path: 'production',
  component: ProductionPage
      },
      {
        path: 'supplies',
  component: SuppliesPage
      },
      {
        path: 'products',
  component: ProductsPage
      },
      {
        path: 'employees',
  component: EmployeesPage
      },
      {
        path: 'cash-flow',
  component: CashFlowPage
      },
      {
        path: 'cif',
  component: CifPage
      }
    ],
  },
];
