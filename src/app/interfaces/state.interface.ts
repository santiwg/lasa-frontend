import { Purchase } from "./purchase.interface";

export interface State {
    id: number;
    scope: string;
    name: string;
    //No hacemos uso de las siguientes referencias por ahora
    //sales: Sale[]; 
    //purchases: Purchase[];
}