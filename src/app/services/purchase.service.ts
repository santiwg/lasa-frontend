import { Injectable } from '@angular/core';
import { axiosClient } from './axios-client';
import { config } from '../config/config';
import { PaginatedData } from '../interfaces/paginated-data.interface';
import { Purchase, PurchaseDto } from '../interfaces/purchase.interface';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {
  private baseUrl = config.urls.purchases;

  constructor() {}
  async getPurchases(page: number, quantity: number,filterType:string='', filterObjectId?: number): Promise<{
    success: true; data: PaginatedData<Purchase>
  } | { success: false; error: string }> {
    try {
      const params = new URLSearchParams({
        page: String(page),
        quantity: String(quantity),
      });

      if (filterType) {
        params.set('filterType', filterType);
      }
      if (filterObjectId != null) {
        params.set('filterObjectId', String(filterObjectId));
      }

      const response = await axiosClient.get(`${this.baseUrl}?${params.toString()}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Unknown Error';
      return { success: false, error: message };
    }
  }

  async createPurchase(purchase: PurchaseDto): Promise<{
    success: true; data: Purchase
  } | { success: false; error: string }> {
    try {
      const response = await axiosClient.post(
        `${this.baseUrl}`,
        purchase
      );
      return { success: true, data: response.data }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Unknown Error";
      return { success: false, error: message };
    }
  }
  
  async deletePurchase(id: number): Promise<{ success: true; data: { message: string } } | { success: false; error: string }> {
    try {
      const response = await axiosClient.delete(
        `${this.baseUrl}/${id}`
      );
      return { success: true, data: response.data }
    }
    catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Unknown Error";
      return { success: false, error: message }
    }
  }

  // Calcula el monto total de una compra a partir de sus detalles
  calculatePurchaseTotal(purchase: Purchase): number {
    if (!purchase || !purchase.details) return 0;
    return purchase.details.reduce(
      (total, detail) => total + detail.historicalUnitPrice * detail.quantity,
      0
    );
  }
}