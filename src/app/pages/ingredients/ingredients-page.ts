import Swal from 'sweetalert2';
// Componente principal de la página de ingredientes
import { Component, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Ingredient } from '../../interfaces/ingredient.interface';
import { IngredientForm } from '../../components/ingredient-form/ingredient-form';
import { Pagination } from '../../components/pagination/pagination';
import { IngredientService } from '../../services/ingredient.service';
import { UnitForm } from "../../components/unit-form/unit-form";
import { AlertService } from '../../services/alert.service';
import { GlobalStatusService } from '../../services/global-status-service';
import { StockMovementForm } from "../../components/stock-movement-form/stock-movement-form";

@Component({
  selector: 'app-ingredients-page',
  standalone: true,
  imports: [IngredientForm, Pagination, UnitForm, CurrencyPipe, StockMovementForm],
  templateUrl: './ingredients-page.html',
  styleUrl: './ingredients-page.css'
})
export class IngredientsPage implements OnInit {
   
  // Lista de ingredientes mostrados en la tabla
  ingredients: Ingredient[] = [];
  // Página actual de la paginación
  page = 1;
  // Cantidad de ingredientes por página
  quantity = 10;
  // Indica si hay más páginas disponibles
  hasNext = false;
  // Controla la visibilidad del modal de creación de ingrediente
  showIngredientModal = false;
  // Controla la visibilidad del modal de creación de unidad
  showCreateUnitModal = false;
  // Controla la visibilidad del modal de movimiento de stock
  showStockMovementModal = false;
  // Elemento que se selecciona para editar, si está vacío es porque se crea uno nuevo
  selectedIngredient?: Ingredient;
//Defino el ambito de las unidades a usar en este componente
  unitScope:string='Alimento'

  constructor(private ingredientService: IngredientService, private alertService: AlertService,private readonly globalStatusService: GlobalStatusService) {}

  // Inicializa la página cargando los ingredientes
  ngOnInit() {
    this.refreshPage();
  }

  // Obtiene los ingredientes de la API y actualiza la lista y paginación
  private refreshPage() {
    this.globalStatusService.setLoading(true);
    this.ingredientService.getIngredients(this.page, this.quantity).then(response => {
      if (response.success) {
        this.ingredients = response.data.data;
        this.hasNext = response.data.hasMore;
      } else {
          this.alertService.error(`Error al obtener los ingredientes: ${response.error}`);
        }
        this.globalStatusService.setLoading(false);
    });
  }

  // Abre el modal para crear un nuevo ingrediente
  openIngredientCreateModal() {
    this.selectedIngredient = undefined; // null indicates create mode
    this.showIngredientModal = true;
  }
  openIngredientEditModal(ingredient: Ingredient) {
    this.selectedIngredient = ingredient; // object indicates edit mode
    this.showIngredientModal = true;
  }
  openStockMovementModal(ingredient: Ingredient) {
    this.selectedIngredient = ingredient;
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

  // Maneja la creación de un nuevo ingrediente
  // 1. Cierra el modal
  // 2. Agrega el ingrediente al principio de la lista
  // 3. Ordena la lista alfabéticamente por nombre
  // 4. Si excede la cantidad máxima, elimina el último y marca hasNext
  onCreateIngredient(ingredient: Ingredient) {
    this.showIngredientModal = false;
    this.globalStatusService.setLoading(true);
    this.ingredients.unshift(ingredient);
    // Ordenar alfabéticamente por nombre
    this.ingredients.sort((a, b) => a.name.localeCompare(b.name));
    //si quedan más elementos de lo debido saco el ultimo y pongo true en hasNext
    if (this.ingredients.length > this.quantity) {
      this.ingredients.pop();
      this.hasNext = true;
    }
    this.globalStatusService.setLoading(false);
  }
  onUpdateIngredient(ingredient: Ingredient) {
      this.showIngredientModal = false;
      this.globalStatusService.setLoading(true);
      // Buscamos el ingrediente viejo por el id y lo reemplazamos por el nuevo
      const index = this.ingredients.findIndex(i => i.id === ingredient.id);
      if (index !== -1) {
        this.ingredients[index] = ingredient;
      }
      this.globalStatusService.setLoading(false);
    }
  async deleteIngredient(ingredient: Ingredient) {
    // Muestra el diálogo de confirmación
    const confirmed = await this.alertService.confirm();
    if (confirmed) {
      // Llama al servicio para eliminar el ingrediente
      this.globalStatusService.setLoading(true);
      const response = await this.ingredientService.deleteIngredient(ingredient.id);

      if (response.success) {
        // Filtra el ingrediente eliminado de la lista
        this.ingredients = this.ingredients.filter(i => i.id !== ingredient.id);

        // Si la página queda vacía y no es la primera, retrocede una página
        if (this.ingredients.length === 0 && this.page > 1) {
          this.previousPage();
        }
        this.globalStatusService.setLoading(false);
        await this.alertService.success('Eliminado', 'El ingrediente ha sido eliminado.');
        
      } else {
        this.globalStatusService.setLoading(false);
        await this.alertService.error(`Hubo un problema eliminando el ingrediente:\n${response.error}`);
      }
    }
  }
  //actualizamos el stock en la vista tras un stock movement
  updateSelectedIngredientStock(newStock: number) {
    if (this.selectedIngredient) {
      this.selectedIngredient.currentStock += newStock;
    }
  }
}
