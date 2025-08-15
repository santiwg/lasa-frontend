import { Injectable } from '@angular/core';
import { axiosClient } from './axios-client';
import { config } from '../config/env';
import { PaginatedData } from '../interfaces/paginated-data.interface';
import { Cif, CifDto } from '../interfaces/cif.interface';

@Injectable({
  providedIn: 'root'
})
export class CifService {
  private baseUrl = config.urls.cif;

  constructor() {}

    async getCifsData(): Promise<{
      success: true; data: {
        paginatedCifs: PaginatedData<Cif>,
        currentMonthTotal: number,
        lastMonthTotal: number
      }
    } | { success: false; error: string }> {
      try {
        const response = await axiosClient.get(`${this.baseUrl}/summary`);
        return { success: true, data: response.data };
      } catch (error: any) {
        const message =
          error.response?.data?.message ||  // si existe un mensaje de error que manda el backend lo uso
          error.message ||                  // mensaje generado por Axios
          "Unknown Error";                  // por si no se obtiene
        return { success: false, error: message };
      }
    }
  
    async createCif(cif:CifDto,page:number,quantity:number): Promise<{
      success: true; data: Cif
    } | { success: false; error: string }
    > {
      try {
        const response = await axiosClient.post(
          `${this.baseUrl}?page=${page}&quantity=${quantity}`,
          cif
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
