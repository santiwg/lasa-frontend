import { Component } from '@angular/core';
import { Product, ProductWithCosts } from '../../interfaces/product.interface';
import { ProductService } from '../../services';
import { AlertService } from '../../services/alert.service';
import { GlobalStatusService } from '../../services/global-status-service';
import { StockMovementForm } from "../../components/stock-movement-form/stock-movement-form";
import { ProductForm } from "../../components/product-form/product-form";
import { UnitForm } from "../../components/unit-form/unit-form";
import { Pagination } from "../../components/pagination/pagination";
import { CurrencyPipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-products',
  imports: [StockMovementForm, ProductForm, UnitForm, Pagination, CurrencyPipe, CommonModule, FormsModule],
  templateUrl: './products-page.html',
  styleUrl: './products-page.css'
})
export class ProductsPage {
  /**
   * Porcentaje de profit esperado para calcular el precio recomendado.
   * Se actualiza desde el input en la tabla y se usa para calcular el precio recomendado.
   */
  desideradProfitPorcentage: number = 0;

  // Lista de productos mostrados en la tabla
  products: ProductWithCosts[] = [];
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
  hasNext = false;
  // Controla la visibilidad del modal de creación de producto
  showProductModal = false;
  // Controla la visibilidad del modal de creación de unidad
  showCreateUnitModal = false;
  // Controla la visibilidad del modal de movimiento de stock
  showStockMovementModal = false;
  // Elemento que se selecciona para editar, si está vacío es porque se crea uno nuevo
  selectedProduct?: ProductWithCosts;
  //Defino el ambito de las unidades a usar en este componente
  unitScope: string = 'Alimento'

  constructor(private productService: ProductService, private alertService: AlertService, private readonly globalStatusService: GlobalStatusService) { }

  // Inicializa la página cargando los productos
  ngOnInit() {
    this.refreshPage();
  }

  // Obtiene los productos de la API y actualiza la lista y paginación
  private refreshPage() {
    this.globalStatusService.setLoading(true);
    this.productService.getProducts(this.page, this.quantity).then(response => {
      if (response.success) {
        this.products = response.data.data;
        this.hasNext = response.data.hasMore;
      } else {
        this.alertService.error(`Error al obtener los productos: ${response.error}`);
      }
      this.globalStatusService.setLoading(false);
    });
  }

  // Abre el modal para crear un nuevo producto
  openProductCreateModal() {
    this.selectedProduct = undefined; // null indicates create mode
    this.showProductModal = true;
  }
  openProductEditModal(product: ProductWithCosts) {
    this.selectedProduct = product; // object indicates edit mode
    this.showProductModal = true;
  }
  openStockMovementModal(product: ProductWithCosts) {
    this.selectedProduct = product;
    this.showStockMovementModal = true;
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


  /**
* Estrategia de actualización de productos:
* 
* Tras crear, editar o eliminar un producto, refrescamos toda la página
* (usando refreshPage()) en vez de modificar manualmente la lista local.
* Esto asegura que los datos de costos y stock estén siempre actualizados
* y consistentes con el backend, ya que los costos pueden depender de la
* cantidad total de productos y otros factores globales.
* 
* Así evitamos mostrar información desactualizada al usuario y mantenemos
* la coherencia de los datos en la interfaz.
*/
  onCreateProduct() {
    this.showProductModal = false;
    this.globalStatusService.setLoading(true);
    this.refreshPage()
    this.globalStatusService.setLoading(false);
  }

  onUpdateProduct() {
    this.showProductModal = false;
    this.globalStatusService.setLoading(true);
    this.refreshPage();
    this.globalStatusService.setLoading(false);
  }
  async deleteProduct(product: ProductWithCosts) {
    // Muestra el diálogo de confirmación
    const confirmed = await this.alertService.confirm();
    if (confirmed) {
      // Llama al servicio para eliminar el producto
      this.globalStatusService.setLoading(true);
      const response = await this.productService.deleteProduct(product.id);

      if (response.success) {
        this.refreshPage()
        if (this.products.length === 0 && this.page > 1) {
          this.previousPage();
        }
        this.globalStatusService.setLoading(false);
        await this.alertService.success('Eliminado', 'El producto ha sido eliminado.');

      } else {
        this.globalStatusService.setLoading(false);
        await this.alertService.error(`Hubo un problema eliminando el producto:\n${response.error}`);
      }
    }
  }
  //actualizamos el stock en la vista tras un stock movement
  updateSelectedProductStock(newStock: number) {
    if (this.selectedProduct) {
      this.selectedProduct.currentStock += newStock;
    }
  }
}
