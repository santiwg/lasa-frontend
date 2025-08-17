import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Ingredient, IngredientDto } from '../../interfaces/ingredient.interface';
import { Unit } from '../../interfaces/unit.interface';
import { IngredientService, UnitService } from '../../services';
import { GlobalStatusService } from '../../services/global-status-service';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-ingredient-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ingredient-form.html',
  styleUrls: ['./ingredient-form.css']
})
export class IngredientForm implements OnInit {
  @Input() ingredient?: Ingredient; // if provided -> edit mode, if not provided -> create mode
  @Output() create = new EventEmitter<Ingredient>();
  @Output() update = new EventEmitter<Ingredient>();
  @Output() cancel = new EventEmitter<void>();
  units: Unit[] = [];
  unitScope: string = 'Alimento'; //ambito usado para las unidades
  form: FormGroup;

  get isEdit(): boolean { return !!this.ingredient; }

  constructor(private fb: FormBuilder, private ingredientService: IngredientService, private unitService: UnitService, private globalStatusService: GlobalStatusService, private alertService: AlertService) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      unitId: [null, Validators.required],
      unitPrice: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    this.loadUnits()
    if (this.isEdit && this.ingredient) {
      this.form.patchValue({
        name: this.ingredient.name,
        unitId: this.ingredient.unit.id,
        unitPrice: this.ingredient.unitPrice
      });
    }
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.value;
    const payload: IngredientDto = {
      name: v.name.trim(),
      unitId: v.unitId,
      unitPrice: Number(v.unitPrice)
    };
    if (this.isEdit) {
      await this.updateIngredient(payload, this.ingredient!.id!);
    } else {
      await this.createIngredient(payload);
    }
  }
  async updateIngredient(ingredient: IngredientDto, id: number) {
      this.globalStatusService.setLoading(true);
    const response = await this.ingredientService.updateIngredient(ingredient, id);
    this.globalStatusService.setLoading(false);
    if (response.success) {
      this.alertService.success('¡Ingrediente actualizado!');
      this.update.emit(response.data);
    } else {
      this.alertService.error(`Surgió un problema editando el ingrediente.\n ${response.error}`);
    }
    this.onCancel(); // close the modal after update
  
  }
  async createIngredient(ingredient: IngredientDto): Promise<void> {
    this.globalStatusService.setLoading(true);
    const response = await this.ingredientService.createIngredient(ingredient);
    this.globalStatusService.setLoading(false);
    if (response.success) {
      this.alertService.success('¡Ingrediente creado!');
      this.create.emit(response.data);
    } else {
      this.alertService.error(`Surgió un problema creando el ingrediente.\n ${response.error}`);
    }
    this.onCancel();
  }
  onCancel() {
    this.cancel.emit();
  }
  // Busca las unidades según el scope
  async loadUnits() {
    this.globalStatusService.setLoading(true);
    const response = await this.unitService.getUnitsByScope(this.unitScope);
    this.globalStatusService.setLoading(false);
    if (response.success) {
      this.units = response.data;
    } else {
      await this.alertService.error(`Error al obtener las unidades: ${response.error}`);
      this.onCancel(); // close the modal if units cannot be loaded
    }
  }
}

