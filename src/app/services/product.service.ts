import { Injectable } from '@angular/core';
import { axiosClient } from './axios-client';
import { config } from '../config/env';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = config.urls.products;

  constructor() {}

  // Métodos CRUD aquí
}
