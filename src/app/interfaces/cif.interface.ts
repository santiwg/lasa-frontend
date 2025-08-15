import { CostType } from "./cost-type.interface";
import { Unit } from "./unit.interface";

export interface Cif {
    id: number;
    costType: CostType;
    dateTime: Date;
    quantity: number;
    unit: Unit;
    unitPrice: number;
}
export interface CifDto {
    costTypeId: number;
    dateTime?: Date;
    quantity: number;
    unitId: number;
    unitPrice: number;
}