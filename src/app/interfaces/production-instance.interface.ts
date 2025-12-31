export interface ProductionInstance {
    id: number;
    dateTime: Date;
    details: ProductionInstanceDetail[];
}

export interface ProductionInstanceDetail {
    id: number;
    productionInstance: ProductionInstance;
    product: Product;
    quantity: number;
    unitCost: number; // cost at the time of production
}

export interface ProductionInstanceDto {
    dateTime?: Date;
    details: ProductionInstanceDetailDto[];
}

export interface ProductionInstanceDetailDto {
    productId: number;
    quantity: number;
    // `unitCost` is always calculated by the backend from the current costs.
}

// Asegúrate de tener importadas las interfaces Product y NewProductionInstanceDetailDto en este archivo o en el proyecto.
