import { Injectable } from '@angular/core';
import { axiosClient } from './axios-client';
import { config } from '../config/config';
import { Unit, UnitDto } from '../interfaces/unit.interface';
import { PaymentMethod } from '../interfaces/payment-method.interface';
import { State } from '../interfaces/state.interface';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private baseUrl = config.urls.state;

  constructor() { }

  async getStatesByScope(scope: string): Promise<{
    success: true; data: State[]
  } | { success: false; error: string }> {
    try {
      const response = await axiosClient.get(`${this.baseUrl}/find-by-scope/${scope}`);
      return { success: true, data: response.data };
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