import { Injectable } from '@angular/core';
import { axiosClient } from './axios-client';
import { config } from '../config/env';
import { CostType, CostTypeDto } from '../interfaces/cost-type.interface';

@Injectable({
  providedIn: 'root'
})
export class CostTypeService {
  private baseUrl = config.urls.costTypes;

  constructor() {}
  async getCostTypes(): Promise<{
        success: true; data: CostType[]
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

      async createCostType(costType: CostTypeDto): Promise<{
        success: true; data: CostType
      } | { success: false; error: string }
      > {
        try {
          const response = await axiosClient.post(
            this.baseUrl,
            costType
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
