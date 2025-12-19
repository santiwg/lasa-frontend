import { Ingredient } from "./ingredient.interface";
import { PaymentDetail } from "./payment.interface";
import { State } from "./state.interface";
import { Supplier } from "./supplier.interface";

export interface PurchaseDto {
    
    supplierId: number;
    details: PurchaseDetailDto[];
    dateTime: Date|null;
    paidAmount: number|null;
    paymentMethodId: number|null;
}
export interface PurchaseDetailDto {
    
    ingredientId: number;  
    quantity: number;
    historicalUnitPrice: number; 
    // Precio unitario histórico al momento de la compra, que dependerá del proveedor y no será necesariamente el previamente registrado en el ingrediente
}
export interface Purchase  {
    id: number;
    dateTime: Date;
    state: State;
    supplier: Supplier;
    details: PurchaseDetail[];
    paymentDetails: PaymentDetail[];
}


export interface PurchaseDetail{
    id: number;
    purchase: Purchase;
    ingredient: Ingredient;
    quantity: number;
    historicalUnitPrice: number;
}