import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FilterSelectionForm, FilterSelectionResult, SelectableEntity } from '../../components/filter-selection-form/filter-selection-form';
import { Pagination } from '../../components/pagination/pagination';
import { ProductionForm } from '../../components/production-form/production-form';
import { Ingredient } from '../../interfaces/ingredient.interface';
import { ProductWithCosts } from '../../interfaces/product.interface';
import { ProductionInstance } from '../../interfaces/production-instance.interface';
import { AlertService } from '../../services/alert.service';
import { GlobalStatusService } from '../../services/global-status-service';
import { ProductService } from '../../services';
import { ProductionInstanceService } from '../../services/production-instance.service';

type ConsumedIngredient = { ingredient: Ingredient; quantity: number };
type GetProductionInstancesResult = Awaited<ReturnType<ProductionInstanceService['getProductionInstances']>>;

@Component({
  selector: 'app-production',
  imports: [CommonModule, Pagination, FilterSelectionForm, ProductionForm],
  templateUrl: './production-page.html',
  styleUrl: './production-page.css'
})
export class ProductionPage {
  @Input() filterType: string = '';
  @Input() filterObjectId?: number;

  productionInstances: ProductionInstance[] = [];

  page = 1;
  quantity = 10;
  hasNext = false;

  showProductionModal = false;
  showProductSelectionModal = false;

  fetchProductOptions: () => Promise<FilterSelectionResult<ProductWithCosts>> = async () => {
    const response = await this.productService.getProducts(1, 1000);
    if (response.success) {
      return { success: true, data: response.data.data };
    }
    return { success: false, error: response.error };
  };

  constructor(
    private readonly route: ActivatedRoute,
    private readonly productionInstanceService: ProductionInstanceService,
    private readonly productService: ProductService,
    private readonly alertService: AlertService,
    private readonly globalStatusService: GlobalStatusService,
  ) { }

  ngOnInit() {
    const productIdParam = this.route.snapshot.queryParamMap.get('productId');
    if (productIdParam) {
      const productId = Number(productIdParam);
      if (!Number.isNaN(productId)) {
        this.filterType = 'product';
        this.filterObjectId = productId;
      }
    }
    this.refreshPage();
  }

  private async refreshPage() {
    this.globalStatusService.setLoading(true);
    await this.loadProductionInstances()
    this.globalStatusService.setLoading(false);
      
  }

  private async loadProductionInstances() {
    const response = await this.productionInstanceService.getProductionInstances(this.page, this.quantity, this.filterType, this.filterObjectId)
    if (response.success) {
      this.productionInstances = response.data.data;
      this.hasNext = response.data.hasMore;
    } else {
      this.alertService.error(`Error al obtener las producciones: ${response.error}`);
    }
  }


  openProductionCreateModal() {
    this.showProductionModal = true;
  }

  openProductSelectionModal() {
    this.showProductSelectionModal = true;
  }

  previousPage() {
    if (this.page > 1) {
      this.page--;
      this.refreshPage();
    }
  }

  nextPage() {
    if (this.hasNext) {
      this.page++;
      this.refreshPage();
    }
  }

  onCreateProductionInstance(instance: ProductionInstance) {
    this.showProductionModal = false;
    this.globalStatusService.setLoading(true);
    this.productionInstances.unshift(instance);
    this.sortProductionInstances();
    if (this.productionInstances.length > this.quantity) {
      this.productionInstances.pop();
      this.hasNext = true;
    }
    this.globalStatusService.setLoading(false);
  }

  private sortProductionInstances(order: 'asc' | 'desc' = 'desc') {
    this.productionInstances.sort((a, b) => {
      const comparison = new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
      return order === 'asc' ? comparison : -comparison;
    });
  }

  async deleteProductionInstance(instance: ProductionInstance) {
    const confirmed = await this.alertService.confirm();
    if (!confirmed) return;

    this.globalStatusService.setLoading(true);
    const response = await this.productionInstanceService.deleteProductionInstance(instance.id);

    if (response.success) {
      if (this.hasNext) {
        this.refreshPage();
      } else {
        this.productionInstances = this.productionInstances.filter(p => p.id !== instance.id);
        if (this.productionInstances.length === 0 && this.page > 1) {
          this.previousPage();
        }
      }

      this.globalStatusService.setLoading(false);
      await this.alertService.success('Eliminado', 'La producción ha sido eliminada.');
    } else {
      this.globalStatusService.setLoading(false);
      await this.alertService.error(`Hubo un problema eliminando la producción:\n${response.error}`);
    }
  }

  onApplyFilters(filterType: string, filterObject: SelectableEntity | null) {
    if (filterObject == null) {
      this.filterObjectId = undefined;
      this.filterType = '';
      this.refreshPage();
      return;
    }

    this.filterType = filterType;
    this.filterObjectId = filterObject.id;
    this.page = 1;
    this.refreshPage();
  }

  calculateConsumedIngredients(instance: ProductionInstance): ConsumedIngredient[] {
    const consumedByIngredientId = new Map<number, ConsumedIngredient>();

    for (const detail of instance.details ?? []) {
      const product: any = (detail as any)?.product;
      if (!product) continue;

      const unitsPerRecipe = Number(product.unitsPerRecipe ?? 0);
      if (!unitsPerRecipe || unitsPerRecipe <= 0) continue;

      // Convertimos “unidades producidas” a “veces de receta” (p.ej. 20 unidades con 10 unitsPerRecipe => 2 recetas)
      const recipesMultiplier = Number(detail.quantity ?? 0) / unitsPerRecipe;
      // Cada item indica cuánto ingrediente se consume por 1 receta
      const recipeItems: any[] = Array.isArray(product.recipeItems) ? product.recipeItems : [];

      for (const item of recipeItems) {
        const ingredient: Ingredient | undefined = item?.ingredient;
        const ingredientId = ingredient?.id;
        if (!ingredientId) continue;

        // Consumo total del ingrediente = consumo por receta * multiplicador de receta
        const itemQty = Number(item?.quantity ?? 0);
        const consumed = itemQty * recipesMultiplier;

        const prev = consumedByIngredientId.get(ingredientId);
        if (prev) {
          prev.quantity += consumed;
        } else {
          consumedByIngredientId.set(ingredientId, { ingredient, quantity: consumed });
        }
      }
    }

    // Pasamos el Map a array y lo ordenamos por nombre para mostrarlo consistente en el dropdown
    return Array.from(consumedByIngredientId.values()).sort((a, b) => a.ingredient.name.localeCompare(b.ingredient.name));
  }
}
