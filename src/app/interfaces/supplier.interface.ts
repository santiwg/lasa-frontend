import { Payment } from "./payment.interface";
import { Purchase } from "./purchase.interface";

export interface SupplierDto {

    businessName: string;
    phone: string;
    email: string;
    cuit: string | null;
    cuil: string | null;
}
export interface SupplierWithBalance {
    id: number;
    businessName: string;
    phone: string;
    email: string;
    cuit: string | null;
    cuil: string | null;
    balancePayable: number;
}
export interface Supplier {
    id: number;
    businessName: string;
    phone: string;
    email: string;
    cuit: string | null;
    cuil: string | null;
    purchases: Purchase[];
    payments: Payment[];
    deletedAt?: Date;
}