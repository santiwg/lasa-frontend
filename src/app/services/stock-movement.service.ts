import { Injectable } from '@angular/core';
import { axiosClient } from './axios-client';
import { config } from '../config/env';

@Injectable({
  providedIn: 'root'
})
export class StockMovementService {
  private baseUrl = config.urls.stockMovements;

  constructor() {}

  // Métodos CRUD aquí
}
