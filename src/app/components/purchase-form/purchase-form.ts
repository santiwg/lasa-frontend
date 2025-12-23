import { Component, EventEmitter, Output } from '@angular/core';
import { Supplier, SupplierWithBalance } from '../../interfaces/supplier.interface';
import { Purchase } from '../../interfaces/purchase.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Ingredient } from '../../interfaces/ingredient.interface';
import { PurchaseService } from '../../services/purchase.service';
import { SupplierService } from '../../services/supplier.service';
import { GlobalStatusService } from '../../services/global-status-service';
import { AlertService } from '../../services/alert.service';
import { IngredientService } from '../../services';
import { PaymentMethodService } from '../../services/payment-method.service';
import { PaymentMethod } from '../../interfaces/payment-method.interface';

@Component({
  selector: 'app-purchase-form',
  imports: [],
  templateUrl: './purchase-form.html',
  styleUrl: './purchase-form.css'
})
export class PurchaseForm {
  //@Input() purchase?: Purchase; // de momento no se puede editar las compras
  //@Output() update = new EventEmitter<Purchase>();
  @Output() create = new EventEmitter<Purchase>();
  
  @Output() cancel = new EventEmitter<void>();
  suppliers: Supplier[] = [];
  
  form: FormGroup;
  ingredients: Ingredient[] = [];
  paymentMethods: PaymentMethod[] = [];
  purchaseDetails: { ingredient: Ingredient; quantity: number; historicalUnitPrice: number }[] = [];
  selectedIngredientId: number | null = null;
  selectedQuantity: number | null = null;
  selectedUnitPrice: number | null = null;
  unitPriceTouched: boolean = false;
  editIndex: number | null = null;
  ingredientTouched: boolean = false;
  quantityTouched: boolean = false;
  onIngredientInput() {
    this.ingredientTouched = true;
  }
  onQuantityInput() {
    this.quantityTouched = true;
  }
  onUnitPriceInput() {
    this.unitPriceTouched = true;
  }

  

  constructor(private fb: FormBuilder, private purchaseService: PurchaseService, private supplierService: SupplierService, private globalStatusService: GlobalStatusService, private alertService: AlertService, private ingredientService: IngredientService, private paymentMethodService: PaymentMethodService) {
    this.form = this.fb.group({
      supplierId: [null, Validators.required],
      paidAmount: [0],
      paymentMethodId: [null],
      date: [new Date().toISOString().substring(0, 10), Validators.required]
    });
  }

  ngOnInit() {
    this.loadSuppliers();
    this.loadIngredients();
    this.loadPaymentMethods();
    //Como no se pueden editar las compras no tenemos el patch inicial
  }

  async loadSuppliers() {
    this.globalStatusService.setLoading(true);
    const response = await this.supplierService.getSuppliers(1, 1000);
    this.globalStatusService.setLoading(false);
    if (response.success) {
      this.suppliers = response.data.data;
    } else {
      await this.alertService.error(`Error al obtener los proveedores: ${response.error}`);
      this.onCancel(); // close the modal if units cannot be loaded
    }
  }
  async loadPaymentMethods(){
    this.globalStatusService.setLoading(true);
    const response = await this.paymentMethodService.getPaymentMethods();
    this.globalStatusService.setLoading(false);
    if (response.success) {
      this.paymentMethods = response.data;
    } else {
      await this.alertService.error(`Error al obtener los métodos de pago: ${response.error}`);
      this.onCancel(); // close the modal if payment methods cannot be loaded
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
