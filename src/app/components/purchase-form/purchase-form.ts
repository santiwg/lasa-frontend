import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { Ingredient } from '../../interfaces/ingredient.interface';
import { PaymentMethod } from '../../interfaces/payment-method.interface';
import { Purchase, PurchaseDto } from '../../interfaces/purchase.interface';
import { Supplier, SupplierWithBalance } from '../../interfaces/supplier.interface';
import { AlertService } from '../../services/alert.service';
import { GlobalStatusService } from '../../services/global-status-service';
import { IngredientService } from '../../services';
import { PaymentMethodService } from '../../services/payment-method.service';
import { PurchaseService } from '../../services/purchase.service';
import { SupplierService } from '../../services/supplier.service';
import { SupplierForm } from '../supplier-form/supplier-form';


@Component({
  selector: 'app-purchase-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SupplierForm],
  templateUrl: './purchase-form.html',
  styleUrl: './purchase-form.css'
})
export class PurchaseForm implements OnInit {
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
  showCreateSupplierModal: boolean = false;
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
    // Fecha local actual (sin problemas de zona horaria)
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const localDate = `${yyyy}-${mm}-${dd}`;
    this.form = this.fb.group({
      supplierId: [null, Validators.required],
      paidAmount: [0, [Validators.min(0)]],
      paymentMethodId: [null],
      date: [localDate, [Validators.required, PurchaseForm.noFutureDateValidator()]]
    }, { validators: PurchaseForm.paymentMethodRequiredWhenPaidValidator() });
  }

  

  // Si se ingresa paidAmount (> 0), entonces debe ingresarse una forma de pago.
  static paymentMethodRequiredWhenPaidValidator(): ValidatorFn {
    return (group: AbstractControl) => {
      const paidAmount = Number(group.get('paidAmount')?.value ?? 0);
      const paymentMethodCtrl = group.get('paymentMethodId');
      const paymentMethodId = paymentMethodCtrl?.value;

      const requiresPaymentMethod = paidAmount > 0;
      const missingPaymentMethod = paymentMethodId == null || paymentMethodId === '';

      // Marcamos el error específicamente en el control `paymentMethodId`.
      // Así, el mensaje "Debe seleccionar un medio de pago" aparece únicamente
      // cuando hay un paidAmount cargado y falta el método.
      if (requiresPaymentMethod && missingPaymentMethod) {
        const existing = paymentMethodCtrl?.errors ?? {};
        if (!existing['paymentMethodRequired']) {
          paymentMethodCtrl?.setErrors({ ...existing, paymentMethodRequired: true });
        }
        return { paymentMethodRequired: true };
      }

      // Si ya no aplica la regla, limpiamos SOLO este error sin pisar otros.
      if (paymentMethodCtrl?.errors?.['paymentMethodRequired']) {
        const { paymentMethodRequired, ...rest } = paymentMethodCtrl.errors;
        paymentMethodCtrl.setErrors(Object.keys(rest).length ? rest : null);
      }
      return null;
    };
  }

  // Evita que se seleccione una fecha futura (comparación por día, sin hora)
  static noFutureDateValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      const raw = control.value;
      if (!raw) return null;

      const selected = new Date(raw);
      if (Number.isNaN(selected.getTime())) return null;

      selected.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return selected.getTime() > today.getTime() ? { futureDate: true } : null;
    };
  }

  async ngOnInit(): Promise<void> {
    await this.loadCatalogs();
    // Como no se pueden editar las compras no tenemos el patch inicial
  }

  private async loadCatalogs(): Promise<void> {
    this.globalStatusService.setLoading(true);
    try {
      const [suppliersResp, paymentMethodsResp, ingredientsResp] = await Promise.all([
        this.supplierService.getSuppliers(1, 1000),
        this.paymentMethodService.getPaymentMethods(),
        this.ingredientService.getIngredients(1, 1000),
      ]);

      if (!suppliersResp.success) {
        await this.alertService.error(`Error al obtener los proveedores: ${suppliersResp.error}`);
        this.onCancel();
        return;
      }

      if (!paymentMethodsResp.success) {
        await this.alertService.error(`Error al obtener los métodos de pago: ${paymentMethodsResp.error}`);
        this.onCancel();
        return;
      }

      if (!ingredientsResp.success) {
        await this.alertService.error(`Error al obtener ingredientes: ${ingredientsResp.error}`);
        this.onCancel();
        return;
      }

      this.suppliers = suppliersResp.data.data;
      this.paymentMethods = paymentMethodsResp.data;
      this.ingredients = ingredientsResp.data.data;
    } finally {
      this.globalStatusService.setLoading(false);
    }
  }

  /**
   * Agrega un nuevo detalle de compra o actualiza uno en edición.
   * Si editIndex es null, agrega al final. Si no, inserta en la posición original.
   * Limpia los inputs después de agregar/actualizar.
   */
  addPurchaseDetail() {
    if (!this.selectedIngredientId || !this.selectedQuantity || this.selectedQuantity <= 0) return;
    const ingredient = this.ingredients.find(i => i.id === this.selectedIngredientId);
    if (!ingredient) return;
    const detail = {
      ingredient,
      quantity: this.selectedQuantity,
      historicalUnitPrice: this.selectedUnitPrice != null && this.selectedUnitPrice >= 0 ? this.selectedUnitPrice : 0
    };
    if (this.editIndex !== null) {
      // Insertar en la posición original (no pisar si el array cambió)
      this.purchaseDetails.splice(this.editIndex, 0, detail);
      this.editIndex = null;
    } else {
      this.purchaseDetails.push(detail);
    }
    this.resetDetailInputs();
  }

  openCreateSupplierModal() {
    this.showCreateSupplierModal = true;
  }
  onAddSupplier(supplier: SupplierWithBalance) {
    const normalized = this.supplierService.supplierToSupplier(supplier);
    this.suppliers.push(normalized);
    this.form.patchValue({ supplierId: normalized.id });
    this.showCreateSupplierModal = false;
  }

  /**
   * Prepara un item para edición: lo quita del array y pone sus datos en los inputs.
   * El índice se guarda en editIndex para saber dónde reinsertar.
   */
  editPurchaseDetail(index: number) {
    const detail = this.purchaseDetails[index];
    this.selectedIngredientId = detail.ingredient.id;
    this.selectedQuantity = detail.quantity;
    this.selectedUnitPrice = detail.historicalUnitPrice;
    this.editIndex = index;
    this.purchaseDetails.splice(index, 1);
  }

  /**
   * Elimina un detalle por índice.
   */
  deletePurchaseDetail(index: number) {
    this.purchaseDetails.splice(index, 1);
  }

  /**
   * Limpia los inputs de detalle luego de agregar/editar.
   */
  private resetDetailInputs() {
    this.selectedIngredientId = null;
    this.selectedQuantity = null;
    this.selectedUnitPrice = null;
    this.ingredientTouched = false;
    this.quantityTouched = false;
    this.unitPriceTouched = false;
  }

  get isAddPurchaseDetailDisabled(): boolean {
    // Habilitar cuando ambos inputs tengan algún valor (validación fuerte queda en addPurchaseDetail)
    return this.selectedIngredientId == null || this.selectedQuantity == null;
  }
  isPurchaseDetailsValid(): boolean {
    return this.purchaseDetails.length > 0;
  }

  async submit() {
    if (this.form.invalid || !this.isPurchaseDetailsValid()) {
      this.form.markAllAsTouched();
      this.form.updateValueAndValidity();
      return;
    }
    const v = this.form.value;
    
    // Crear fecha en zona horaria local sin conversión UTC
    let dateTime: Date;
    if (v.date) {
      const [year, month, day] = v.date.split('-').map(Number);
      dateTime = new Date(year, month - 1, day);
      
      // Agregar hora actual solo si la fecha seleccionada es hoy
      const today = new Date();
      const isToday = year === today.getFullYear() && 
                      month - 1 === today.getMonth() && 
                      day === today.getDate();
      
      if (isToday) {
        dateTime.setHours(today.getHours(), today.getMinutes(), today.getSeconds(), today.getMilliseconds());
      } else {
        dateTime.setHours(0, 0, 0, 0);
      }
    } else {
      dateTime = new Date();
    }
    
    const payload: PurchaseDto = {
      supplierId: Number(v.supplierId),
      paidAmount: Number(v.paidAmount) > 0 ? Number(v.paidAmount) : null,
      paymentMethodId: Number(v.paymentMethodId) ? Number(v.paymentMethodId) : null,
      dateTime: dateTime,
      details: this.purchaseDetails.map(item => ({
        ingredientId: item.ingredient.id,
        quantity: item.quantity,
        historicalUnitPrice: item.historicalUnitPrice
      }))
    };
    //Como no se pueden editar las compras, siempre creamos una nueva
    await this.createPurchase(payload);
  }


  async createPurchase(purchase: PurchaseDto): Promise<void> {
    this.globalStatusService.setLoading(true);
    const response = await this.purchaseService.createPurchase(purchase);
    this.globalStatusService.setLoading(false);
    if (response.success) {
      await this.alertService.success('¡Compra registrada!');
      await this.alertService.info('Algunos estados de compra pueden quedar desactualizados. Refresca la página para ver los cambios.');
      this.create.emit(response.data);
    } else {
      this.alertService.error(`Surgió un problema registrando la compra.\n ${response.error}`);
    }
    this.onCancel();
  }
  onCancel() {
    this.cancel.emit();
  }
}
