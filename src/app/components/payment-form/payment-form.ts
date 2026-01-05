import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Supplier, SupplierWithBalance } from '../../interfaces/supplier.interface';
import { Payment, PaymentDto } from '../../interfaces/payment.interface';
import { PaymentMethod } from '../../interfaces/payment-method.interface';
import { PaymentService } from '../../services/payment.service';
import { SupplierService } from '../../services/supplier.service';
import { PaymentMethodService } from '../../services/payment-method.service';
import { GlobalStatusService } from '../../services/global-status-service';
import { AlertService } from '../../services/alert.service';
import { DateUtilsService } from '../../services/date-utils.service';
import { SupplierForm } from '../supplier-form/supplier-form';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SupplierForm],
  templateUrl: './payment-form.html',
  styleUrl: './payment-form.css'
})
export class PaymentForm implements OnInit {

  @Output() create = new EventEmitter<Payment>();
  @Output() cancel = new EventEmitter<void>();

  suppliers: Supplier[] = [];
  paymentMethods: PaymentMethod[] = [];
  form: FormGroup;
  showCreateSupplierModal = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly paymentService: PaymentService,
    private readonly supplierService: SupplierService,
    private readonly paymentMethodService: PaymentMethodService,
    private readonly globalStatusService: GlobalStatusService,
    private readonly alertService: AlertService,
    private readonly dateUtils: DateUtilsService,
  ) {
    // Fecha local actual (sin problemas de zona horaria)
    const localDate = this.dateUtils.getTodayLocalDateString();
    this.form = this.fb.group(
      {
        supplierId: [null, Validators.required],
        paidAmount: [null, [Validators.required, Validators.min(1)]],
        paymentMethodId: [null, Validators.required],
        date: [localDate, [Validators.required, this.dateUtils.noFutureDateValidator()]],
      },
    );
  }

  async ngOnInit(): Promise<void> {
    await this.loadCatalogs();
  }

  private async loadCatalogs(): Promise<void> {
    this.globalStatusService.setLoading(true);
    const [suppliersResp, paymentMethodsResp] = await Promise.all([
      this.supplierService.getSuppliers(1, 1000),
      this.paymentMethodService.getPaymentMethods(),
    ]);
    this.globalStatusService.setLoading(false);

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

    this.suppliers = suppliersResp.data.data;
    this.paymentMethods = paymentMethodsResp.data;
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

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.form.updateValueAndValidity();
      return;
    }

    const v = this.form.value;

    // Crear fecha en zona horaria local sin conversión UTC
    const dateTime = this.dateUtils.buildDateTimeFromDateString(v.date);
    
    const payload: PaymentDto = {
      supplierId: Number(v.supplierId),
      paidAmount: Number(v.paidAmount) > 0 ? Number(v.paidAmount) : 0,
      paymentMethodId: Number(v.paymentMethodId),
      dateTime: dateTime,
    };

    await this.createPayment(payload);
  }

  private async createPayment(payment: PaymentDto): Promise<void> {
    this.globalStatusService.setLoading(true);
    const response = await this.paymentService.createPayment(payment);
    this.globalStatusService.setLoading(false);

    if (response.success) {
      await this.alertService.success('¡Pago registrado!');
      this.create.emit(response.data);
    } else {
      await this.alertService.error(`Surgió un problema registrando el pago.\n ${response.error}`);
    }

    this.onCancel();
  }

  onCancel() {
    this.cancel.emit();
  }
}
