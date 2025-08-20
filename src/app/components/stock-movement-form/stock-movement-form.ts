import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { Product, ProductWithCosts } from '../../interfaces/product.interface';
import { Ingredient } from '../../interfaces/ingredient.interface';
import { StockMovementService } from '../../services';
import { AlertService } from '../../services/alert.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GlobalStatusService } from '../../services/global-status-service';
import { StockMovementDto } from '../../interfaces/stock-movement-interface';

import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-stock-movement-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './stock-movement-form.html',
  styleUrls: ['./stock-movement-form.css']
})
export class StockMovementForm {
  @Input() ingredient?: Ingredient;
  @Input() product?: ProductWithCosts;
  @Output() cancel = new EventEmitter<void>();
  //si tiene exito le aviso al componente padre que actualice el stock mostrado en la pantalla
  @Output() updateStock = new EventEmitter<number>();

  hoyHora: string = new Date().toISOString().slice(0, 16);

  // Información del ítem para poner en label del form
  itemName: string = '';
  itemCurrentStock: number = 0;
  form: FormGroup;

  get isIngredient(): boolean { return !!this.ingredient; }
  get isProduct(): boolean { return !!this.product; }

  constructor(private fb: FormBuilder, private stockMovementService: StockMovementService, private globalStatusService: GlobalStatusService, private alertService: AlertService) {
    this.form = this.fb.group({
      quantity: [0, Validators.required],
      description: [''],
      date: [null]
    });
  }

  ngOnInit() {
    if (this.isIngredient && this.ingredient) {
      this.itemName = this.ingredient.name;
      this.itemCurrentStock = this.ingredient.currentStock;
    } else if (this.isProduct && this.product) {
      this.itemName = this.product.name;
      this.itemCurrentStock = this.product.currentStock;
    }
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    const payload: StockMovementDto = {
      ingredientId: this.isIngredient ? this.ingredient!.id! : undefined,
      productId: this.isProduct ? this.product!.id! : undefined,
      quantity: v.quantity,
      dateTime: v.date || undefined,
      description: v.description?.trim() || undefined
    };
    await this.createStockMovement(payload);
  }
  async createStockMovement(stockMovement: StockMovementDto): Promise<void> {
    this.globalStatusService.setLoading(true);
    const response = await this.stockMovementService.createStockMovement(stockMovement);
    this.globalStatusService.setLoading(false);
    if (response.success) {
      this.alertService.success('¡Movimiento de stock creado!');
      this.updateStock.emit(response.data.quantity);
    } else {
      this.alertService.error(`Surgió un problema creando el movimiento de stock.\n ${response.error}`);
    }
    this.onCancel();
  }
  onCancel() {
    this.cancel.emit();
  }

}
