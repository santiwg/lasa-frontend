import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Pagination } from '../../components/pagination/pagination';
import { FilterSelectionForm, FilterSelectionResult, SelectableEntity } from '../../components/filter-selection-form/filter-selection-form';
import { Purchase } from '../../interfaces/purchase.interface';
import { State } from '../../interfaces/state.interface';
import { Supplier, SupplierWithBalance } from '../../interfaces/supplier.interface';
import { AlertService } from '../../services/alert.service';
import { GlobalStatusService } from '../../services/global-status-service';
import { PurchaseService } from '../../services/purchase.service';
import { StateService } from '../../services/state.service';
import { SupplierService } from '../../services/supplier.service';

@Component({
  selector: 'app-purchases',
  imports: [CommonModule, Pagination, FilterSelectionForm],
  templateUrl: './purchases-page.html',
  styleUrl: './purchases-page.css'
})
export class PurchasesPage {

  @Input() filterType: string = '';
  @Input() filterObjectId?: number;

  // Lista de compras mostrados en la tabla
  purchases: Purchase[] = [];
  // Página actual de la paginación

  page = 1;
  // Cantidad de productos por página 
  quantity = 10;
  // Indica si hay más páginas disponibles
  hasNext = false;
  // Controla la visibilidad del modal de creación de compra
  showPurchaseModal = false;
  // Controla la visibilidad del modal de creación de selección de estado
  showStateSelectionModal = false;
  // Controla la visibilidad del modal de movimiento de selección de proveedor
  showSupplierSelectionModal = false;
  // Elemento que se selecciona para editar, si está vacío es porque se crea uno nuevo
  selectedPurchase?: Purchase;
  //Defino el ambito de los estados a usar en este componente
  stateScope: string = 'Compra'

  fetchSupplierOptions: () => Promise<FilterSelectionResult<Supplier>> = async () => {
    const response = await this.supplierService.getSuppliers(1, 1000); //asumo que no hay más de 1000 proveedores
    if (response.success) {
      return { success: true, data: response.data.data };
    }
    return { success: false, error: response.error };
  };

  fetchStateOptions: () => Promise<FilterSelectionResult<State>> = async () => {
    return await this.stateService.getStatesByScope(this.stateScope);
  };

  constructor(
    private readonly purchaseService: PurchaseService,
    private readonly supplierService: SupplierService,
    private readonly stateService: StateService,
    private readonly alertService: AlertService,
    private readonly globalStatusService: GlobalStatusService,
  ) { }

  // Inicializa la página cargando los productos
  ngOnInit() {
    this.refreshPage();
  }
  calculateTotalCost(purchase: Purchase): number {
    return purchase.details.reduce((total, detail) => total + (detail.historicalUnitPrice * detail.quantity), 0);
  }

  // Obtiene los productos de la API y actualiza la lista y paginación
  private refreshPage() {
    this.globalStatusService.setLoading(true);
    this.purchaseService
      .getPurchases(this.page, this.quantity, this.filterType, this.filterObjectId)
      .then(response => {
        if (response.success) {
          this.purchases = response.data.data;
          this.hasNext = response.data.hasMore;
        } else {
          this.alertService.error(`Error al obtener las compras: ${response.error}`);
        }
      })
      .catch((err: any) => {
        const message = err?.message ? String(err.message) : String(err);
        this.alertService.error(`Error al obtener las compras: ${message}`);
      })
      .finally(() => {
        this.globalStatusService.setLoading(false);
      });
  }

  // Abre el modal para crear una nueva compra
  openPurchaseCreateModal() {
    this.selectedPurchase = undefined; // null indicates create mode
    this.showPurchaseModal = true;
  }
  openPurchaseEditModal(purchase: Purchase) {
    this.selectedPurchase = purchase; // object indicates edit mode
    this.showPurchaseModal = true;
  }
  openStateSelectionModal() {
    this.showStateSelectionModal = true;
  }
  openSupplierSelectionModal() {
    this.showSupplierSelectionModal = true;
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
  
  onCreatePurchase(purchase: Purchase) {
    this.showPurchaseModal = false;
    this.globalStatusService.setLoading(true);
    this.purchases.unshift(purchase);
    // Ordenar alfabéticamente por nombre
    this.sortPurchases();
    //si quedan más elementos de lo debido saco el ultimo y pongo true en hasNext
    if (this.purchases.length > this.quantity) {
      this.purchases.pop();
      this.hasNext = true;
    }
    this.globalStatusService.setLoading(false);
  }
  sortPurchases(sort: string = 'dateTime', order: 'asc' | 'desc' = 'desc') {

    this.purchases.sort((a, b) => {
      const comparison = new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
      return order === 'asc' ? comparison : -comparison;
    });
    //De momento por fecha es la única forma de ordenar las compras
  }



  onUpdatePurchase(purchase: Purchase) {
    this.showPurchaseModal = false;
    this.globalStatusService.setLoading(true);
    // Buscamos la compra vieja por el id y lo reemplazamos por el nuevo
    const index = this.purchases.findIndex(i => i.id === purchase.id);
    if (index !== -1) {
      this.purchases[index] = purchase;
    }
    this.globalStatusService.setLoading(false);
  }

  async deletePurchase(purchase: Purchase) {
    // Muestra el diálogo de confirmación
    const confirmed = await this.alertService.confirm();
    if (confirmed) {
      // Llama al servicio para eliminar la compra
      this.globalStatusService.setLoading(true);
      const response = await this.purchaseService.deletePurchase(purchase.id);

      if (response.success) {
        // Filtra la compra eliminada de la lista
        if (this.hasNext) {
          this.refreshPage(); //refresco toda la pagina si hay mas elementos, para mantener la consistencia en la cantidad de elementos mostrados
        } else {
          this.purchases = this.purchases.filter(i => i.id !== purchase.id);

          // Si la página queda vacía y no es la primera, retrocede una página
          if (this.purchases.length === 0 && this.page > 1) {
            this.previousPage();
          }
        }

        this.globalStatusService.setLoading(false);
        await this.alertService.success('Eliminado', 'La compra ha sido eliminada.');

      } else {
        this.globalStatusService.setLoading(false);
        await this.alertService.error(`Hubo un problema eliminando la compra:\n${response.error}`);
      }
    }
  }

  onApplyFilters(filterType: string, filterObject:SelectableEntity|null) {
    if (filterObject == null) {
      this.filterObjectId = undefined;
      this.filterType = '';
      //A la page no la vuelvo a 1, la dejo donde está
      this.refreshPage();
      return;
    }
    this.filterType = filterType;
    this.filterObjectId = filterObject.id;
    this.page = 1;
    this.refreshPage();
  }


}
