import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Product } from '../../interfaces/product.interface';
import { ProductionInstance, ProductionInstanceDto } from '../../interfaces/production-instance.interface';
import { AlertService } from '../../services/alert.service';
import { DateUtilsService } from '../../services/date-utils.service';
import { GlobalStatusService } from '../../services/global-status-service';
import { ProductService } from '../../services';
import { ProductionInstanceService } from '../../services/production-instance.service';

@Component({
  selector: 'app-production-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './production-form.html',
  styleUrl: './production-form.css'
})
export class ProductionForm implements OnInit {
  @Output() create = new EventEmitter<ProductionInstance>();
  @Output() cancel = new EventEmitter<void>();

  products: Product[] = [];
  form: FormGroup;

  productionDetails: { product: Product; quantity: number }[] = [];
  selectedProductId: number | null = null;
  selectedQuantity: number | null = null;

  productTouched = false;
  quantityTouched = false;
  editIndex: number | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly productionInstanceService: ProductionInstanceService,
    private readonly productService: ProductService,
    private readonly globalStatusService: GlobalStatusService,
    private readonly alertService: AlertService,
    private readonly dateUtils: DateUtilsService,
  ) {
    // Fecha local actual (sin problemas de zona horaria)
    const localDate = this.dateUtils.getTodayLocalDateString();

    this.form = this.fb.group({
      date: [localDate, [Validators.required, this.dateUtils.noFutureDateValidator()]],
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadCatalogs();
  }

  private async loadCatalogs(): Promise<void> {
    this.globalStatusService.setLoading(true);
    try {
      const productsResp = await this.productService.getProducts(1, 1000);
      if (!productsResp.success) {
        await this.alertService.error(`Error al obtener los productos: ${productsResp.error}`);
        this.onCancel();
        return;
      }
      this.products = productsResp.data.data;
    } finally {
      this.globalStatusService.setLoading(false);
    }
  }

  onProductInput() {
    this.productTouched = true;
  }

  onQuantityInput() {
    this.quantityTouched = true;
  }

  get isAddDetailDisabled(): boolean {
    return this.selectedProductId == null || this.selectedQuantity == null;
  }

  isProductionDetailsValid(): boolean {
    return this.productionDetails.length > 0;
  }

  addProductionDetail(): void {
    if (!this.selectedProductId || !this.selectedQuantity || this.selectedQuantity <= 0) return;
    const product = this.products.find(p => p.id === this.selectedProductId);
    if (!product) return;

    const detail = {
      product,
      quantity: this.selectedQuantity,
    };

    if (this.editIndex !== null) {
      this.productionDetails.splice(this.editIndex, 0, detail);
      this.editIndex = null;
    } else {
      this.productionDetails.push(detail);
    }

    this.resetDetailInputs();
  }

  editProductionDetail(index: number): void {
    const detail = this.productionDetails[index];
    this.selectedProductId = detail.product.id;
    this.selectedQuantity = detail.quantity;
    this.editIndex = index;
    this.productionDetails.splice(index, 1);
  }

  deleteProductionDetail(index: number): void {
    this.productionDetails.splice(index, 1);
  }

  private resetDetailInputs(): void {
    this.selectedProductId = null;
    this.selectedQuantity = null;
    this.productTouched = false;
    this.quantityTouched = false;
  }

  async submit(): Promise<void> {
    if (this.form.invalid || !this.isProductionDetailsValid()) {
      this.form.markAllAsTouched();
      this.form.updateValueAndValidity();
      return;
    }

    const v = this.form.value;
    const payload: ProductionInstanceDto = {
      dateTime: this.dateUtils.buildDateTimeFromDateString(v.date),
      details: this.productionDetails.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
    };

    await this.createProductionInstance(payload);
  }

  private async createProductionInstance(dto: ProductionInstanceDto): Promise<void> {
    this.globalStatusService.setLoading(true);
    const response = await this.productionInstanceService.createProductionInstance(dto);
    this.globalStatusService.setLoading(false);

    if (response.success) {
      await this.alertService.success('¡Producción registrada!');
      this.create.emit(response.data);
    } else {
      await this.alertService.error(`Surgió un problema registrando la producción.\n ${response.error}`);
    }

    this.onCancel();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
