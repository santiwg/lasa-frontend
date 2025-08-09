import { Injectable } from '@angular/core';
import { axiosClient } from './axios-client';
import { config } from '../config/env';

@Injectable({
  providedIn: 'root'
})
export class CifService {
  private baseUrl = config.urls.cif;

  constructor() {}

  // Métodos CRUD aquí
}
