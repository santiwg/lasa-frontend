import { Injectable } from '@angular/core';
import { axiosClient } from './axios-client';
import { config } from '../config/config';
import { PaymentMethod } from '../interfaces/payment-method.interface';

@Injectable({
  providedIn: 'root'
})
export class PaymentMethodService {
  private baseUrl = config.urls.paymentMethods;

  constructor() { }

  async getPaymentMethods(): Promise<{
    success: true; data: PaymentMethod[]
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

}