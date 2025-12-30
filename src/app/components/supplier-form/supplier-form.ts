import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { SupplierDto, SupplierWithBalance } from '../../interfaces/supplier.interface';
import { AlertService } from '../../services/alert.service';
import { GlobalStatusService } from '../../services/global-status-service';
import { SupplierService } from '../../services/supplier.service';

@Component({
  selector: 'app-supplier-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './supplier-form.html',
  styleUrls: ['./supplier-form.css']
})
export class SupplierForm implements OnInit {
  @Input() supplier: SupplierWithBalance | null = null; // edit mode when provided

  @Output() create = new EventEmitter<SupplierWithBalance>();
  @Output() update = new EventEmitter<SupplierWithBalance>();
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup;

  get isEdit(): boolean { return !!this.supplier; }

  constructor(
    private readonly fb: FormBuilder,
    private readonly alert: AlertService,
    private readonly globalStatusService: GlobalStatusService,
    private readonly supplierService: SupplierService,
  ) {
    this.form = this.fb.group({
      businessName: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[\d\-() ]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      cuit: ['', [Validators.pattern(/^[\d-]+$/)]],
      cuil: ['', [Validators.pattern(/^[\d-]+$/)]],
    }, { validators: SupplierForm.cuitCuilRequiredValidator() });
  }

  //pensado para asegurar que el usuario cargue al menos uno de los dos campos (cuit o cuil).
  static cuitCuilRequiredValidator(): ValidatorFn {
    return (group: AbstractControl) => {
      const cuit = group.get('cuit')?.value;
      const cuil = group.get('cuil')?.value;
      // Si ambos están vacíos, el formulario es inválido.
      // Esto mantiene el botón deshabilitado hasta que se complete al menos uno.
      if (!cuit && !cuil) {
        return { cuitCuilRequired: true };
      }
      return null;
    };
  }

  ngOnInit(): void {
    if (this.supplier) {
      this.form.patchValue({
        businessName: this.supplier.businessName,
        phone: this.supplier.phone,
        email: this.supplier.email,
        cuit: this.supplier.cuit ?? '',
        cuil: this.supplier.cuil ?? '',
      });
    }
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      // Al guardar, marcamos todo como touched para mostrar mensajes de validación.
      // La regla CUIT/CUIL requerido ya se muestra antes gracias a `dirty` en el validador.
      this.form.markAllAsTouched();
      this.form.updateValueAndValidity();
      return;
    }

    const confirmed = await this.alert.confirm();
    if (!confirmed) return;

    const v = this.form.value;
    const payload: SupplierDto = {
      businessName: v.businessName!,
      phone: v.phone || '',
      email: v.email!,
      cuit: v.cuit || null,
      cuil: v.cuil || null,
    };

    if (this.isEdit && this.supplier) {
      await this.updateSupplier(payload, this.supplier.id);
    } else {
      await this.createSupplier(payload);
    }
  }

  private async createSupplier(payload: SupplierDto): Promise<void> {
    this.globalStatusService.setLoading(true);
    const response = await this.supplierService.createSupplier(payload);
    this.globalStatusService.setLoading(false);

    if (response.success) {
      this.alert.success('¡Proveedor creado!');
      this.create.emit(response.data);
    } else {
      this.alert.error(`Surgió un problema creando el proveedor.\n ${response.error}`);
    }
    this.onCancel();
  }

  private async updateSupplier(payload: SupplierDto, id: number): Promise<void> {
    this.globalStatusService.setLoading(true);
    const response = await this.supplierService.updateSupplier(payload, id);
    this.globalStatusService.setLoading(false);

    if (response.success) {
      this.alert.success('¡Proveedor actualizado!');
      this.update.emit(response.data);
    } else {
      this.alert.error(`Surgió un problema editando el proveedor.\n ${response.error}`);
    }
    this.onCancel();
  }

  onCancel(): void {
    this.cancel.emit();
  }

}
