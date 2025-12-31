import { Injectable } from '@angular/core';
import { axiosClient } from './axios-client';
import { ProductionInstance, ProductionInstanceDto } from '../interfaces/production-instance.interface';
import { PaginatedData } from '../interfaces/paginated-data.interface';
import { config } from '../config/config';

@Injectable({ providedIn: 'root' })
export class ProductionInstanceService {
  private readonly baseUrl = config.urls.productionInstances;

  async getProductionInstances(page: number, quantity: number, filterType: string = '', filterObjectId?: number): Promise<{ success: true; data: PaginatedData<ProductionInstance> } | { success: false; error: string }> {
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
      const message = error.response?.data?.message || error.message || 'Unknown Error';
      return { success: false, error: message };
    }
  }

  async createProductionInstance(dto: ProductionInstanceDto): Promise<{ success: true; data: ProductionInstance } | { success: false; error: string }> {
    try {
      const response = await axiosClient.post(this.baseUrl, dto);
      return { success: true, data: response.data };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Unknown Error';
      return { success: false, error: message };
    }
  }

  async deleteProductionInstance(id: number): Promise<{ success: true; message: string } | { success: false; error: string }> {
    try {
      const response = await axiosClient.delete(`${this.baseUrl}/${id}`);
      return { success: true, message: response.data.message };
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Unknown Error';
      return { success: false, error: message };
    }
  }
}
