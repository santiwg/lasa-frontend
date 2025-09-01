import { Injectable } from '@angular/core';
import { axiosClient } from './axios-client';
import { config } from '../config/config';
import { EmployeeRole, EmployeeRoleDto } from '../interfaces/employee-role.interface';

@Injectable({
  providedIn: 'root'
})
export class EmployeeRoleService {
  private baseUrl = config.urls.employeeRoles;

  constructor() {}
  async getEmployeeRoles(): Promise<{
      success: true; data: EmployeeRole[]
    } | { success: false; error: string }> {
      try {
        const response = await axiosClient.get(this.baseUrl);
        return { success: true, data: response.data };
      } catch (error: any) {
        const message =
          error.response?.data?.message ||  // si existe un mensaje de error que manda el backend lo uso
          error.message ||                  // mensaje generado por Axios
          "Unknown Error";                  // por si no se obtiene
        return { success: false, error: message };
      }
    }
  
    async createEmployeeRole(employeeRole: EmployeeRoleDto): Promise<{
      success: true; data: EmployeeRole
    } | { success: false; error: string }
    > {
      try {
        const response = await axiosClient.post(
          this.baseUrl,
          employeeRole
        );
  
        return { success: true, data: response.data }
  
      } catch (error: any) {
        const message =
          error.response?.data?.message ||  // si existe un mensaje de error que manda el backend lo uso
          error.message ||                  // mensaje generado por Axios
          "Unknown Error";                  // por si no se obtiene
        return { success: false, error: message };
      }
    }
  // Métodos CRUD aquí
}
