import { Injectable } from '@angular/core';
import { axiosClient } from './axios-client';
import { config } from '../config/env';
import { Employee, EmployeeDto } from '../interfaces/employee.interface';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private baseUrl = config.urls.employees;

  constructor() { }

  async getEmployees(): Promise<{
    success: true; data: Employee[]
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

  async createEmployee(employee: EmployeeDto): Promise<{
    success: true; data: Employee
  } | { success: false; error: string }
  > {
    try {
      const response = await axiosClient.post(
        this.baseUrl,
        employee
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
  async updateEmployee(employee: EmployeeDto, id: number): Promise<{
    success: true; data: Employee
  } | { success: false; error: string }> {
    try {
      const response = await axiosClient.put(
        `${this.baseUrl}/${id}`,
        employee
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
