import { PaymentMethod } from "./payment-method.interface";
import { Purchase } from "./purchase.interface";
import { Supplier } from "./supplier.interface";

export interface PaymentDto {
    dateTime: Date | null;
    supplierId: number;
    paidAmount: number;
    paymentMethodId: number;
}
export interface Payment{
    id: number;
    unassignedAmount:number; 
    //this property represents the amount that is not assigned to any purchase yet 
    //it is used when the paidAmount is greater than what is owed to supplier.
    //more explanation in documentation.
    dateTime: Date;
    supplier: Supplier;
    paymentMethod: PaymentMethod;
    details: PaymentDetail[];

}
export interface PaymentDetail{
    id: number;
    amount: number;
    payment: Payment;
    purchase: Purchase;
}