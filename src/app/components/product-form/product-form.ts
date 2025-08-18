import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProductWithCosts, ProductDto } from '../../interfaces/product.interface';
import { Unit } from '../../interfaces/unit.interface';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { UnitService } from '../../services/unit.service';
import { GlobalStatusService } from '../../services/global-status-service';
import { AlertService } from '../../services/alert.service';
import { Ingredient } from '../../interfaces/ingredient.interface';
import { IngredientService } from '../../services/ingredient.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css'
})
export class ProductForm {
  @Input() product?: ProductWithCosts; // if provided -> edit mode, if not provided -> create mode
  @Output() create = new EventEmitter<ProductWithCosts>();
  @Output() update = new EventEmitter<ProductWithCosts>();
  @Output() cancel = new EventEmitter<void>();
  units: Unit[] = [];
  unitScope: string = 'Alimento'; //ambito usado para las unidades
  form: FormGroup;
  ingredients: Ingredient[] = [];
  recipeItems: { ingredient: Ingredient; quantity: number; }[] = [];
  selectedIngredientId: number | null = null;
  selectedQuantity: number | null = null;
  editIndex: number | null = null;
  ingredientTouched: boolean = false;
  quantityTouched: boolean = false;
  onIngredientInput() {
    this.ingredientTouched = true;
  }
  onQuantityInput() {
    this.quantityTouched = true;
  }

  get isEdit(): boolean { return !!this.product; }

  constructor(private fb: FormBuilder, private productService: ProductService, private unitService: UnitService, private globalStatusService: GlobalStatusService, private alertService: AlertService, private ingredientService: IngredientService) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      unitId: [null, Validators.required],
      unitsPerRecipe: [null, [Validators.required, Validators.min(1)]],
      laborHoursPerRecipe: [null, [Validators.required, Validators.min(0)]],
      price: [null, [Validators.required, Validators.min(1)]],
      expectedKilosPerMonth: [null, [Validators.required, Validators.min(0)]],
      complexityFactor: [1, [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadUnits();
    this.loadIngredients();
    if (this.isEdit && this.product) {
      this.form.patchValue({
        name: this.product.name,
        unitId: this.product.unit.id,
        unitsPerRecipe: this.product.unitsPerRecipe,
        laborHoursPerRecipe: this.product.laborHoursPerRecipe,
        price: this.product.price,
        expectedKilosPerMonth: this.product.expectedKilosPerMonth,
        complexityFactor: this.product.complexityFactor
      });
      // Si hay items, los cargamos en el array
      if (this.product.recipeItems) {
        this.recipeItems = this.product.recipeItems.map(item => ({
          ingredient: item.ingredient,
          quantity: item.quantity
        }));
      }
    }
  }

  async loadUnits() {
    this.globalStatusService.setLoading(true);
    const response = await this.unitService.getUnitsByScope(this.unitScope);
    this.globalStatusService.setLoading(false);
    if (response.success) {
      this.units = response.data;
    } else {
      await this.alertService.error(`Error al obtener las unidades: ${response.error}`);
      this.onCancel(); // close the modal if units cannot be loaded
    }
  } 

  async loadIngredients() {
    this.globalStatusService.setLoading(true);
    const response = await this.ingredientService.getIngredients(1, 1000); //ARREGLAR, DEBERIA PODERSE PASAR SIN PARAMETROS DE PAGINACION
    this.globalStatusService.setLoading(false);
    if (response.success) {
      this.ingredients = response.data.data;
    } else {
      await this.alertService.error(`Error al obtener ingredientes: ${response.error}`);
    }
  }

  /**
   * Agrega un nuevo item de receta o actualiza uno en edición.
   * Si editIndex es null, agrega al final. Si no, inserta en la posición original.
   * Limpia los inputs después de agregar/actualizar.
   */
  addRecipeItem() {
    if (!this.selectedIngredientId || !this.selectedQuantity || this.selectedQuantity <= 0) return;
    const ingredient = this.ingredients.find(i => i.id === this.selectedIngredientId);
    if (!ingredient) return;
    const item = {
      ingredient,
      quantity: this.selectedQuantity
    };
    if (this.editIndex !== null) {
      // Insertar en la posición original (no pisar si el array cambió)
      this.recipeItems.splice(this.editIndex, 0, item);
      this.editIndex = null;
    } else {
      this.recipeItems.push(item);
    }
    this.selectedIngredientId = null;
    this.selectedQuantity = null;
    this.ingredientTouched = false;
    this.quantityTouched = false;
  }

  /**
   * Prepara un item para edición: lo quita del array y pone sus datos en los inputs.
   * El índice se guarda en editIndex para saber dónde reinsertar.
   */
  editRecipeItem(index: number) {
    const item = this.recipeItems[index];
    this.selectedIngredientId = item.ingredient.id;
    this.selectedQuantity = item.quantity;
    this.editIndex = index;
    this.recipeItems.splice(index, 1);
  }

  /**
   * Elimina un item de receta por índice.
   */
  deleteRecipeItem(index: number) {
    this.recipeItems.splice(index, 1);

  }
  get isAddRecipeItemDisabled(): boolean {
    // Habilitar cuando ambos inputs tengan algún valor (validación fuerte queda en addRecipeItem)
    return this.selectedIngredientId == null || this.selectedQuantity == null;
  }
  isRecipeValid(): boolean {
    return this.recipeItems.length > 0;
  }

  async submit() {
    if (this.form.invalid || !this.isRecipeValid()) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    const payload: ProductDto = {
      name: v.name.trim(),
      unitId: Number(v.unitId),
      unitsPerRecipe: Number(v.unitsPerRecipe),
      laborHoursPerRecipe: Number(v.laborHoursPerRecipe),
      price: Number(v.price),
      expectedKilosPerMonth: Number(v.expectedKilosPerMonth),
      complexityFactor: Number(v.complexityFactor),
      items: this.recipeItems.map(item => ({
        ingredientId: item.ingredient.id,
        quantity: item.quantity
      }))
    };
    if (this.isEdit) {
      await this.updateProduct(payload, this.product!.id!);
    } else {
      await this.createProduct(payload);
    }
  }
  async updateProduct(product: ProductDto, id: number) {
    this.globalStatusService.setLoading(true);
    const response = await this.productService.updateProduct(product, id);
    this.globalStatusService.setLoading(false);
    if (response.success) {
      this.alertService.success('¡Producto actualizado!');
      this.update.emit(response.data);
    } else {
      this.alertService.error(`Surgió un problema editando el producto.\n ${response.error}`);
    }
    this.onCancel(); // close the modal after update
  }
  async createProduct(product: ProductDto): Promise<void> {
    this.globalStatusService.setLoading(true);
    const response = await this.productService.createProduct(product);
    this.globalStatusService.setLoading(false);
    if (response.success) {
      this.alertService.success('¡Producto creado!');
      this.create.emit(response.data);
    } else {
      this.alertService.error(`Surgió un problema creando el producto.\n ${response.error}`);
    }
    this.onCancel();
  }
  onCancel() {
    this.cancel.emit();
  }
}
