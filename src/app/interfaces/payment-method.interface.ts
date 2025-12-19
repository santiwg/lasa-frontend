export interface PaymentMethod  {
    id: number;
    name: string;
    description: string | null;

    //No hacemos uso de las siguientes referencias por ahora
    //payments: Payment[];
    //paymentCollections: PaymentCollection[];
}