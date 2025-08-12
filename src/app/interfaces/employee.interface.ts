import { EmployeeRole } from "./employee-role.interface";

    export interface Employee{
        id: number;
        name: string;
        email: string;
        lastName: string;
        hourlyWage: number;
        isActive: boolean;
        role:EmployeeRole;
        phoneNumber: string;
        cuit?: string;
        cuil?: string;
    }
    