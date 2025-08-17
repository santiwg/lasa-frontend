import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../../interfaces/product.interface';
import { Ingredient } from '../../interfaces/ingredient.interface';
import { IngredientService } from '../../services';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-stock-movement-form',
  imports: [],
  templateUrl: './stock-movement-form.html',
  styleUrl: './stock-movement-form.css'
})
export class StockMovementForm {
    @Input() ingredient?: Ingredient;
    @Input() product?: Product;
    @Output() cancel = new EventEmitter<void>();
    //si tiene exito le aviso al componente padre que actualice el stock mostrado en la pantalla
    @Output() updateStock = new EventEmitter<number>();


    constructor(private ingredientService: IngredientService, private alertService: AlertService) {}

    async onSubmit() {
    }
}
