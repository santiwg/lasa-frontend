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
    // IMPLEMENTACIÓN ORIGINAL (pegando al backend)
    try {
      const response = await axiosClient.get(this.baseUrl);
      return { success: true, data: response.data };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Unknown Error";
      return { success: false, error: message };
    }
  }

}