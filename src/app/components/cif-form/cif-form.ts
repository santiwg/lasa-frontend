import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertService } from '../../services/alert.service';
import { GlobalStatusService } from '../../services/global-status-service';
import { CostTypeService } from '../../services/cost-type.service';
import { UnitService } from '../../services/unit.service';
import { CostType } from '../../interfaces/cost-type.interface';
import { Unit } from '../../interfaces/unit.interface';
import { Cif, CifDto } from '../../interfaces/cif.interface';
import { CifService } from '../../services/cif.service';

@Component({
  selector: 'app-cif-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cif-form.html',
  styleUrls: ['./cif-form.css']
})
export class CifForm implements OnInit {
  unitScope: string = 'Frecuencia'; //ambito usado para el cif
  hoyHora: string = new Date().toISOString().slice(0,16);
  @Output() create = new EventEmitter<Cif>();
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup;
  costTypes: CostType[] = [];
  units: Unit[] = [];

  constructor(
    private fb: FormBuilder,
    private alert: AlertService,
    private globalStatusService: GlobalStatusService,
    private costTypeService: CostTypeService,
    private unitService: UnitService,
    private cifService: CifService
  ) {
    // Inicializa el formulario reactivo según la interfaz CifDto
    this.form = this.fb.group({
      costTypeId: [null, Validators.required],
      dateTime: [null],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitId: [null, Validators.required],
      unitPrice: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    this.loadCostTypes();
    this.loadUnits();
  }

  // Busca los tipos de costo
  async loadCostTypes() {
    this.globalStatusService.setLoading(true);
    const response = await this.costTypeService.getCostTypes();
    this.globalStatusService.setLoading(false);
    if (response.success) {
      this.costTypes = response.data;
    } else {
      await this.alert.error(`Error al obtener los tipos de costo: ${response.error}`);
    }
  }

  // Busca las unidades según el scope
  async loadUnits() {
    this.globalStatusService.setLoading(true);
    const response = await this.unitService.getUnitsByScope(this.unitScope);
    this.globalStatusService.setLoading(false);
    if (response.success) {
      this.units = response.data;
    } else {
      await this.alert.error(`Error al obtener las unidades: ${response.error}`);
    }
  }

  // Maneja el submit del formulario (solo creación)
  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const confirmed = await this.alert.confirm();
    if (!confirmed) return;
    const v = this.form.value;
    const payload: CifDto = {
      costTypeId: v.costTypeId,
      dateTime: v.dateTime || undefined,
      quantity: Number(v.quantity),
      unitId: v.unitId,
      unitPrice: Number(v.unitPrice)
    };
    await this.createCif(payload);
  }

  // Llama al service para crear y emite el evento
  async createCif(payload: CifDto): Promise<void> {
    this.globalStatusService.setLoading(true);
    const response = await this.cifService.createCif(payload);
    this.globalStatusService.setLoading(false);
    if (response.success) {
      this.alert.success('¡CIF creado!');
      this.create.emit(response.data);
    } else {
      this.alert.error(`Surgió un problema creando el CIF.\n ${response.error}`);
    }
    this.onCancel();
  }

  // Emite el evento para cerrar el modal
  onCancel(): void {
    this.cancel.emit();
  }
}
