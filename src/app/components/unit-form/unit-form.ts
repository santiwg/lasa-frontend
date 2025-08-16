import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges, OnChanges } from '@angular/core';
import { AlertService } from '../../services/alert.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UnitDto } from '../../interfaces/unit.interface';
import { UnitService } from '../../services/unit.service';
import { GlobalStatusService } from '../../services/global-status-service';

@Component({
  selector: 'app-unit-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './unit-form.html',
  styleUrls: ['./unit-form.css']
})
export class UnitForm implements OnChanges {
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['unitScope'] && !changes['unitScope'].firstChange) {
      this.form.get('scope')?.setValue(this.unitScope);
    }
  }
  // Solo modo creación, no edición
  // No se emite evento de creación, el padre no lo necesita
  @Output() cancel = new EventEmitter<void>();

  //Defino un input que será el valor por defecto de scope, según el padre
  @Input() unitScope: string = 'Alimento'; // Default scope, can be overridden by parent component

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private alert: AlertService,
    private globalStatusService: GlobalStatusService,
    private readonly unitService: UnitService
  ) {
    // Inicializa el formulario reactivo con los campos requeridos
    this.form = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      scope: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.form.get('scope')?.setValue(this.unitScope);
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
    const payload: UnitDto = {
      name: v.name.trim(),
      description: v.description?.trim() || undefined,
      scope: v.scope.trim()
    };
    await this.createUnit(payload);
  }

  // Llama al servicio para crear la unidad y muestra feedback
  async createUnit(payload: UnitDto): Promise<void> {
    this.globalStatusService.setLoading(true);
    const response = await this.unitService.createUnit(payload);
    this.globalStatusService.setLoading(false);
    if (response.success) {
      this.alert.success('¡Unidad creada!');
    } else {
      this.alert.error(`Surgió un problema creando la unidad.\n ${response.error}`);
    }
    this.onCancel(); // cierra el modal después de crear
  }

  // Emite el evento para cerrar el modal
  onCancel(): void {
    this.cancel.emit();
  }
}
