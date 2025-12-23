import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Supplier, SupplierWithBalance } from '../../interfaces/supplier.interface';
import { GlobalStatusService } from '../../services/global-status-service';
import { AlertService } from '../../services/alert.service';
import { SupplierService } from '../../services/supplier.service';
import { Pagination } from '../../components/pagination/pagination';
import { SupplierForm } from '../../components/supplier-form/supplier-form';

@Component({
  selector: 'app-suppliers',
  imports: [CommonModule, RouterLink, Pagination, SupplierForm],
  templateUrl: './suppliers-page.html',
  styleUrl: './suppliers-page.css'
})
export class SuppliersPage {

  // Lista de proveedores mostrados en la tabla
  suppliers: SupplierWithBalance[] = [];
  // Página actual de la paginación
  /*
  Hay que corregir lo de la paginación para que funcione por query o path params,
  porque como está ahora además de ser poco profesional vuelve a la primer pagina
  cuando el usuario recarga
  */


  page = 1;
  // Cantidad de productos por página 
  quantity = 10;
  // Indica si hay más páginas disponibles
  sort?: 'businessName' | 'balance' | undefined;
  order?: 'asc' | 'desc';
  hasNext = false;
  // Controla la visibilidad del modal de creación de producto
  showSupplierModal = false;
  // Elemento que se selecciona para editar, si está vacío es porque se crea uno nuevo
  selectedSupplier?: SupplierWithBalance;

  constructor(private supplierService: SupplierService, private alertService: AlertService, private readonly globalStatusService: GlobalStatusService) { }

  // Inicializa la página cargando los productos
  ngOnInit() {
    this.refreshPage();
  }

  // Obtiene los productos de la API y actualiza la lista y paginación
  private refreshPage() {
    this.globalStatusService.setLoading(true);
    this.supplierService.getSuppliersWithBalance(this.page, this.quantity, this.sort, this.order).then(response => {
      if (response.success) {
        this.suppliers = response.data.data;
        this.hasNext = response.data.hasMore;
      } else {
        this.alertService.error(`Error al obtener los proveedores: ${response.error}`);
      }
      this.globalStatusService.setLoading(false);
    });
  }
  // Abre el modal para crear un nuevo producto
  openSupplierCreateModal() {
    this.selectedSupplier = undefined; // null indicates create mode
    this.showSupplierModal = true;
  }
  openSupplierEditModal(supplier: SupplierWithBalance) {
    this.selectedSupplier = supplier; // object indicates edit mode
    this.showSupplierModal = true;
  }


  // Cambia a la página anterior si es posible
  previousPage() {
    if (this.page > 1) {
      this.page--;
      this.refreshPage();
    }
  }

  // Cambia a la página siguiente si hay más elementos
  nextPage() {
    if (this.hasNext) {
      this.page++;
      this.refreshPage();
    }
  }

  onSortByBussinessName() {
    this.sort = 'businessName';
    this.refreshPage();
  }
  onSortByBalance() {
    this.sort = 'balance';
    this.refreshPage();
  }

  onCreateSupplier(supplier: SupplierWithBalance) {
    this.showSupplierModal = false;
    this.globalStatusService.setLoading(true);
    this.suppliers.unshift(supplier);
    // Ordenar alfabéticamente por nombre
    this.sortSuppliers(this.sort, this.order);
    //si quedan más elementos de lo debido saco el ultimo y pongo true en hasNext
    if (this.suppliers.length > this.quantity) {
      this.suppliers.pop();
      this.hasNext = true;
    }
    this.globalStatusService.setLoading(false);
  }
  sortSuppliers(sort: string = 'businessName', order: 'asc' | 'desc' = 'asc') {
    if (sort === 'businessName') {
      this.suppliers.sort((a, b) => {
        const comparison = a.businessName.localeCompare(b.businessName);
        return order === 'asc' ? comparison : -comparison;
      });
    }
    else if (sort === 'balance') {
      this.suppliers.sort((a, b) => {
        const comparison = a.balance - b.balance;
        return order === 'asc' ? comparison : -comparison;
      });
    }
  }
  onUpdateSupplier(supplier: SupplierWithBalance) {
    this.showSupplierModal = false;
    this.globalStatusService.setLoading(true);
    // Buscamos el proveedor viejo por el id y lo reemplazamos por el nuevo
    const index = this.suppliers.findIndex(i => i.id === supplier.id);
    if (index !== -1) {
      this.suppliers[index] = supplier;
    }
    this.globalStatusService.setLoading(false);
  }

  async deleteSupplier(supplier: SupplierWithBalance) {
    // Muestra el diálogo de confirmación
    const confirmed = await this.alertService.confirm();
    if (confirmed) {
      // Llama al servicio para eliminar el proveedor
      this.globalStatusService.setLoading(true);
      const response = await this.supplierService.deleteSupplier(supplier.id);

      if (response.success) {
        // Filtra el proveedor eliminado de la lista
        if (this.hasNext){
          this.refreshPage(); //refresco toda la pagina si hay mas elementos, para mantener la consistencia en la cantidad de elementos mostrados
        } else {
          this.suppliers = this.suppliers.filter(i => i.id !== supplier.id);

          // Si la página queda vacía y no es la primera, retrocede una página
          if (this.suppliers.length === 0 && this.page > 1) {
            this.previousPage();
          }
        }

        this.globalStatusService.setLoading(false);
        await this.alertService.success('Eliminado', 'El proveedor ha sido eliminado.');

      } else {
        this.globalStatusService.setLoading(false);
        await this.alertService.error(`Hubo un problema eliminando el proveedor:\n${response.error}`);
      }
    }
  }
  determineBalanceColor(balance: number): string {
    if (balance > 0) {
      return 'green';
    } else if (balance < 0) {
      return 'red';
    } else {
      return 'grey';
    } 
  }

}
