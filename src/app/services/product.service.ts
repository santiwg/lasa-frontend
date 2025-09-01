import { Injectable } from '@angular/core';
import { axiosClient } from './axios-client';
import { config } from '../config/config';
import { PaginatedData } from '../interfaces/paginated-data.interface';
import { Product, ProductDto, ProductWithCosts } from '../interfaces/product.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = config.urls.products;

  constructor() {}
  async getProducts(page: number, quantity: number): Promise<{
    success: true; data: PaginatedData<ProductWithCosts>
  } | { success: false; error: string }> {
    try {
      const response = await axiosClient.get(`${this.baseUrl}?page=${page}&quantity=${quantity}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Unknown Error";
      return { success: false, error: message };
    }
  }

  async createProduct(product: ProductDto): Promise<{
    success: true; data: ProductWithCosts
  } | { success: false; error: string }> {
    try {
      const response = await axiosClient.post(
        `${this.baseUrl}`,
        product
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

  async updateProduct(product: ProductDto, id: number): Promise<{
    success: true; data: ProductWithCosts
  } | { success: false; error: string }> {
    try {
      const response = await axiosClient.put(
        `${this.baseUrl}/${id}`,
        product
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

  async deleteProduct(id: number): Promise<{ success: true; data: { message: string } } | { success: false; error: string }> {
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
  // Métodos CRUD aquí
}
