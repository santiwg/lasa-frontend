import { Injectable } from '@angular/core';
import { axiosClient } from './axios-client';
import { config } from '../config/env';

@Injectable({
  providedIn: 'root'
})
export class IngredientService {
  private baseUrl = config.urls.ingredients;

  constructor() {}

  // Métodos CRUD aquí
}
