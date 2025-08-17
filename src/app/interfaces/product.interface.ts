import { RecipeItem, RecipeItemDto } from "./recipe-item.interface";
import { Unit } from "./unit.interface";

export interface Product {
    id: number;
    name: string;
    unit: Unit;
    currentStock: number;
    unitsPerRecipe: number;
    laborHoursPerRecipe: number;
    price: number;
    expectedKilosPerMonth: number;
    complexityFactor: number;
    recipeItems: RecipeItem[];

}
export interface ProductDto {
    name: string;
    unitId: number;
    unitsPerRecipe: number;
    laborHoursPerRecipe: number;
    price: number;
    expectedKilosPerMonth: number;
    complexityFactor: ComplexityFactor;
    items: RecipeItemDto[];
}
export interface ProductWithCosts {
    id: number;
    name: string;
    unit: any;
    currentStock: number;
    unitsPerRecipe: number;
    laborHoursPerRecipe: number;
    price: number;
    expectedKilosPerMonth: number;
    complexityFactor: any;
    recipeItems: RecipeItem[];
    unitaryCif: number;
    unitaryLaborCost: number;
    unitCost: number;
    recipeCost: number;
}
export enum ComplexityFactor {
    SIMPLE = 1,
    MEDIUM = 1.5,
    COMPLEX = 2
}