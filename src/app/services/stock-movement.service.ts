import { Injectable } from '@angular/core';
import { axiosClient } from './axios-client';
import { config } from '../config/env';
import { StockMovement } from '../interfaces/stock-movement-interface';

@Injectable({
  providedIn: 'root'
})
export class StockMovementService {
  private baseUrl = config.urls.stockMovements;

  constructor() {}
  async getStockMovements(): Promise<{
      success: true; data: StockMovement[]
    }
      | { success: false; error: string }> {
      try {
        const response = await axiosClient.get(`${this.baseUrl}`);
        return { success: true, data: response.data };
      } catch (error: any) {
        const message =
          error.response?.data?.message ||  // si existe un mensaje de error que manda el backend lo uso
          error.message ||                  // mensaje generado por Axios
          "Unknown Error";                  // por si no se obtiene
        return { success: false, error: message };
      }
    }

    async createStockMovement(stockMovement: StockMovement): Promise<{
      success: true; data: StockMovement
    } | { success: false; error: string }
    > {
      try {
        const response = await axiosClient.post(
          `${this.baseUrl}`,
          stockMovement
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
