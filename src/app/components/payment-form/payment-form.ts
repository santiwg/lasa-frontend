import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AbstractControl, FormsModule, ValidatorFn } from '@angular/forms';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Supplier, SupplierWithBalance } from '../../interfaces/supplier.interface';
import { Payment, PaymentDto } from '../../interfaces/payment.interface';
import { PaymentMethod } from '../../interfaces/payment-method.interface';
import { PaymentService } from '../../services/payment.service';
import { SupplierService } from '../../services/supplier.service';
import { PaymentMethodService } from '../../services/payment-method.service';
import { GlobalStatusService } from '../../services/global-status-service';
import { AlertService } from '../../services/alert.service';
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
  ) {
    // Fecha local actual (sin problemas de zona horaria)
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const localDate = `${yyyy}-${mm}-${dd}`;
    this.form = this.fb.group(
      {
        supplierId: [null, Validators.required],
        paidAmount: [null, [Validators.required, Validators.min(1)]],
        paymentMethodId: [null, Validators.required],
        date: [localDate, [Validators.required, PaymentForm.noFutureDateValidator()]],
      },
    );
  }

  async ngOnInit(): Promise<void> {
    await this.loadCatalogs();
  }


  // Evita que se seleccione una fecha futura (misma lógica que en PurchaseForm)
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
