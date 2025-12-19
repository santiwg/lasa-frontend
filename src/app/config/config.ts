import { environment } from '../../environments/environment';

export const config = {
  urls: {
    cif: `${environment.backendUrl}/cifs`,
    employees: `${environment.backendUrl}/employees`,
    products: `${environment.backendUrl}/products`,
    employeeRoles: `${environment.backendUrl}/employee-roles`,
    costTypes: `${environment.backendUrl}/cost-types`,
    ingredients: `${environment.backendUrl}/ingredients`,
    unit: `${environment.backendUrl}/units`,
    stockMovements: `${environment.backendUrl}/stock-movements`,
    users: `${environment.backendUrl}/users`,
    paymentMethods: `${environment.backendUrl}/payment-methods`,
    suppliers: `${environment.backendUrl}/suppliers`,
    purchases: `${environment.backendUrl}/purchases`,
    payments: `${environment.backendUrl}/payments`,
    state: `${environment.backendUrl}/states`,
  },
};
