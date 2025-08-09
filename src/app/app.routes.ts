import { Routes } from '@angular/router';
import { TemplateComponent } from './pages/template/template';
import { Home } from './pages/home/home';
import { Sales } from './pages/sales/sales';
import { Purchases } from './pages/purchases/purchases';
import { Collections } from './pages/collections/collections';
import { Payments } from './pages/payments/payments';
import { Suppliers } from './pages/suppliers/suppliers';
import { Customers } from './pages/customers/customers';
import { Production } from './pages/production/production';
import { Supplies } from './pages/supplies/supplies';
import { Products } from './pages/products/products';
import { Employees } from './pages/employees/employees';
import { CashFlow } from './pages/cash-flow/cash-flow';
import { Cif } from './pages/cif/cif';

export const routes: Routes = [
  {
    path: '',
    component: TemplateComponent,
    children: [
      {
        path: '',
        component: Home,
      },
      {
        path: 'sales',
        component: Sales
      },
      {
        path: 'purchases',
        component: Purchases
      },
      {
        path: 'collections',
        component: Collections
      },
      {
        path: 'payments',
        component: Payments
      },
      {
        path: 'suppliers',
        component: Suppliers
      },
      {
        path: 'customers',
        component: Customers
      },
      {
        path: 'production',
        component: Production
      },
      {
        path: 'supplies',
        component: Supplies
      },
      {
        path: 'products',
        component: Products
      },
      {
        path: 'employees',
        component: Employees
      },
      {
        path: 'cash-flow',
        component: CashFlow
      },
      {
        path: 'cif',
        component: Cif
      }
    ],
  },
];
