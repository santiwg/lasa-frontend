import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { AlertService } from '../../services/alert.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CostTypeDto } from '../../interfaces/cost-type.interface';
import { CostTypeService } from '../../services/cost-type.service';
import { GlobalStatusService } from '../../services/global-status-service';

@Component({
  selector: 'app-cost-type-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cost-type-form.html',
  styleUrls: ['./cost-type-form.css']
})
export class CostTypeForm {
  // Solo modo creación, no edición
  // No se emite evento de creación, el padre no lo necesita
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private alert: AlertService,
    private globalStatusService: GlobalStatusService,
    private readonly costTypeService: CostTypeService
  ) {
    // Inicializa el formulario reactivo con los campos requeridos
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: ['']
    });
  }

  // Maneja el submit del formulario
  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // Confirma la acción con el usuario
    const confirmed = await this.alert.confirm();
    if (!confirmed) return;
    const v = this.form.value;
    const payload: CostTypeDto = {
      name: v.name.trim(),
      description: v.description?.trim() || undefined
    };
    await this.createCostType(payload);
  }

  // Llama al servicio para crear el cost type y muestra feedback
  async createCostType(payload: CostTypeDto): Promise<void> {
    this.globalStatusService.setLoading(true);
    const response = await this.costTypeService.createCostType(payload);
    this.globalStatusService.setLoading(false);
    if (response.success) {
      this.alert.success('¡Tipo de costo creado!');
    } else {
      this.alert.error(`Surgió un problema creando el tipo de costo.\n ${response.error}`);
    }
    this.onCancel(); // cierra el modal después de crear
  }

  // Emite el evento para cerrar el modal
  onCancel(): void {
    this.cancel.emit();
  }
}
