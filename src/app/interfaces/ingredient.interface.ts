import { Unit } from "./unit.interface";

export interface Ingredient {
    id: number;
    name: string;
    unitPrice: number;
    currentStock: number;
    unit: Unit;
}
export interface IngredientDto {
    name: string;
    unitId: number;
    unitPrice: number;
}