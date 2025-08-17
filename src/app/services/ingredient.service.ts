import { Injectable } from '@angular/core';
import { axiosClient } from './axios-client';
import { config } from '../config/env';
import { PaginatedData } from '../interfaces/paginated-data.interface';
import { Ingredient, IngredientDto } from '../interfaces/ingredient.interface';

@Injectable({
  providedIn: 'root'
})
export class IngredientService {
  private baseUrl = config.urls.ingredients;

  constructor() { }
  async getIngredients(page: number, quantity: number): Promise<{
    success: true; data: PaginatedData<Ingredient>
  }
    | { success: false; error: string }> {
    try {
      const response = await axiosClient.get(`${this.baseUrl}/page=${page}&quantity=${quantity}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      const message =
        error.response?.data?.message ||  // si existe un mensaje de error que manda el backend lo uso
        error.message ||                  // mensaje generado por Axios
        "Unknown Error";                  // por si no se obtiene
      return { success: false, error: message };
    }
  }

  async createIngredient(ingredient: IngredientDto): Promise<{
    success: true; data: Ingredient
  } | { success: false; error: string }
  > {
    try {
      const response = await axiosClient.post(
        `${this.baseUrl}`,
        ingredient
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
  async updateIngredient(ingredient: IngredientDto, id: number): Promise<{
    success: true; data: Ingredient
  } | { success: false; error: string }
  > {
    try {
      const response = await axiosClient.put(
        `${this.baseUrl}/${id}`,
        ingredient
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
  async deleteIngredient(id: number): Promise<{ success: true; data: { message: string } } | { success: false; error: string }> {
    try {
      const response = await axiosClient.delete(
        `${this.baseUrl}/${id}`
      );
      return { success: true, data: response.data }
    }
    catch (error: any) {
      const message =
        error.response?.data?.message ||  // si existe un mensaje de error que manda el backend lo uso
        error.message ||                  // mensaje generado por Axios
        "Unknown Error";                  // por si no se obtiene

      return { success: false, error: message }
    }
  }
  // Métodos CRUD aquí
}
