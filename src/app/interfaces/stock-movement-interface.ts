import { Ingredient } from "./ingredient.interface";
import { Product } from "./product.interface";

export interface StockMovement {
    id: number;
    quantity: number;
    dateTime: Date;
    product?: Product;
    description?: string;
    ingredient?: Ingredient;
}
export interface StockMovementDto {
    productId?: number;
    ingredientId?: number;
    quantity: number;
    description?: string;
    dateTime?: Date;
}