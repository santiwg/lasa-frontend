import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AlertService } from '../../services/alert.service';
import { GlobalStatusService } from '../../services/global-status-service';

// `T` representa el tipo de entidad que el modal va a listar.
// Se restringe a `{ id: number }` porque el componente trabaja contra IDs:
// - El <select> guarda el `id` como value
// - Se resuelve el objeto buscando ese `id` en `options`
export type FilterSelectionResult<T extends { id: number }> =
  | { success: true; data: T[] }
  | { success: false; error: string };

// Forma mínima que necesita el componente para funcionar.
// (El resto de propiedades son dinámicas: displayProp decide qué se muestra.)
export type SelectableEntity = { id: number; [key: string]: any };

@Component({
  selector: 'app-filter-selection-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './filter-selection-form.html',
  styleUrl: './filter-selection-form.css'
})
export class FilterSelectionForm implements OnInit {
  @Input({ required: true }) headerText = '';
  @Input() placeholderText = 'Seleccionar…';

  // Propiedad a mostrar en el select (por ej: 'name' o 'businessName')
  @Input() displayProp: string = 'name';

  // Función para cargar opciones (desde el padre)
  @Input({ required: true }) fetchOptions!: () => Promise<FilterSelectionResult<SelectableEntity>>; //Este tipo de dato está definido más arriba

  // Emite el objeto elegido; si el usuario selecciona "Ninguno", se emite `null`.
  @Output() selected = new EventEmitter<SelectableEntity | null>();
  @Output() cancel = new EventEmitter<void>();

  options: SelectableEntity[] = [];
  form: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly alertService: AlertService,
    private readonly globalStatusService: GlobalStatusService,
  ) {
    this.form = this.fb.group({
      // Guardamos el `id` seleccionado (number) y no el objeto completo.
      // Luego se resuelve contra `options` para obtener el objeto, o `null` si elige "Ninguno".
      selectedId: [null],
    });
  }

  ngOnInit(): void {
    this.loadOptions();
  }

  async loadOptions(): Promise<void> {
    if (!this.fetchOptions) {
      this.alertService.error('No se configuró la carga de opciones.');
      return;
    }

    this.globalStatusService.setLoading(true);
    try {
      const response = await this.fetchOptions();
      if (response.success) {
        this.options = response.data;
      } else {
        this.alertService.error(`Error al obtener opciones: ${response.error}`);
        this.onCancel();
      }
    } catch (err: any) {
      const message = err?.message ? String(err.message) : String(err);
      this.alertService.error(`Error al obtener opciones: ${message}`);
      this.onCancel();
    } finally {
      this.globalStatusService.setLoading(false);
    }
  }

  getOptionLabel(option: SelectableEntity): string {
    const v = (option as any)?.[this.displayProp];
    if (v == null) return '';
    return String(v);
  }

  onSelect(): void {
    const selectedId = this.form.get('selectedId')?.value as number | null;

    // Opción explícita "Ninguno": se devuelve null
    if (selectedId == null) {
      this.selected.emit(null);
      this.onCancel();
      return;
    }

    const selectedObj = this.options.find(o => o.id === selectedId);
    if (!selectedObj) {
      this.alertService.error('Debe seleccionar una opción válida.');
      return;
    }

    this.selected.emit(selectedObj);
    this.onCancel();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
