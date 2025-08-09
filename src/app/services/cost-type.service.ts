import { Injectable } from '@angular/core';
import { axiosClient } from './axios-client';
import { config } from '../config/env';

@Injectable({
  providedIn: 'root'
})
export class CostTypeService {
  private baseUrl = config.urls.costTypes;

  constructor() {}

  // Métodos CRUD aquí
}
