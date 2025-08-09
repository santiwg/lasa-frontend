import { Injectable } from '@angular/core';
import { axiosClient } from './axios-client';
import { config } from '../config/env';

@Injectable({
  providedIn: 'root'
})
export class UnitService {
  private baseUrl = config.urls.unit;

  constructor() {}

  // Métodos CRUD aquí
}
