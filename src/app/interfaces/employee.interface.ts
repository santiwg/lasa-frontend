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
    export interface EmployeeCreate{
        name: string;
        email: string;
        lastName: string;
        hourlyWage: number;
        isActive: boolean;
        roleId: number;
        phoneNumber: string;
        cuit?: string;
        cuil?: string;
    }
    export interface EmployeeUpdate{
        id: number;
        name: string;
        email: string;
        lastName: string;
        hourlyWage: number;
        isActive: boolean;
        roleId: number;
        phoneNumber: string;
        cuit?: string;
        cuil?: string;
    }
    