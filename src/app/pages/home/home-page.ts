import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

type HomeCard = {
  title: string;
  subtitle: string;
  path: string;
  iconSrc: string;
  iconAlt: string;
};

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css'
})
export class HomePage {
  cards: HomeCard[] = [
    { title: 'Ventas', subtitle: 'Registrar y consultar ventas', path: '/sales', iconSrc: '/images/sales-icon.PNG', iconAlt: 'Ventas' },
    { title: 'Compras', subtitle: 'Registrar y consultar compras', path: '/purchases', iconSrc: '/images/purchases-icon.PNG', iconAlt: 'Compras' },
    { title: 'Cobros', subtitle: 'Registrar cobros', path: '/collections', iconSrc: '/images/payment-collection-icon.PNG', iconAlt: 'Cobros' },
    { title: 'Pagos', subtitle: 'Registrar pagos', path: '/payments', iconSrc: '/images/payment-icon.PNG', iconAlt: 'Pagos' },
    { title: 'Clientes', subtitle: 'Administrar clientes', path: '/customers', iconSrc: '/images/clients-icon.PNG', iconAlt: 'Clientes' },
    { title: 'Proveedores', subtitle: 'Administrar proveedores', path: '/suppliers', iconSrc: '/images/suppliers-icon.PNG', iconAlt: 'Proveedores' },
    { title: 'Producción', subtitle: 'Instancias y consumo', path: '/production', iconSrc: '/images/production-icon.PNG', iconAlt: 'Producción' },
    { title: 'Insumos', subtitle: 'Stock y precios', path: '/supplies', iconSrc: '/images/ingredients-icon.png', iconAlt: 'Insumos' },
    { title: 'Productos', subtitle: 'Recetas y costos', path: '/products', iconSrc: '/images/products-icon.PNG', iconAlt: 'Productos' },
    { title: 'Empleados', subtitle: 'Administrar empleados', path: '/employees', iconSrc: '/images/employee-icon.PNG', iconAlt: 'Empleados' },
    { title: 'Flujo de caja', subtitle: 'Ingresos y egresos', path: '/cash-flow', iconSrc: '/images/cash-flow-icon.PNG', iconAlt: 'Flujo de caja' },
    { title: 'CIF', subtitle: 'Costos indirectos de fabricación', path: '/cif', iconSrc: '/images/cif-icon.PNG', iconAlt: 'CIF' },
  ];
}
