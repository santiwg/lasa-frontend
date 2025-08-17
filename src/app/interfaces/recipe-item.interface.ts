import { Ingredient } from "./ingredient.interface";

export interface RecipeItem{
    id: number;
    ingredient: Ingredient;
    quantity: number;
}

export interface RecipeItemDto {
    ingredientId: number;
    quantity: number;
}