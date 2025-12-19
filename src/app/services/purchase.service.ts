import { Injectable } from '@angular/core';
import { axiosClient } from './axios-client';
import { config } from '../config/config';
import { PaginatedData } from '../interfaces/paginated-data.interface';
import { Product, ProductDto, ProductWithCosts } from '../interfaces/product.interface';
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
      const response = await axiosClient.get(`${this.baseUrl}?page=${page}&quantity=${quantity}&filterType=${filterType}&filterObjectId=${filterObjectId || ''}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Unknown Error";
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
}