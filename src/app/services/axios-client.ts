import axios, { AxiosInstance } from 'axios';

class AxiosClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Aquí puedes agregar tokens de autenticación, logs, etc.
        console.log('Request sent:', config);
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        // Manejar respuestas exitosas
        return response;
      },
      (error) => {
        // Manejar errores globalmente
        console.error('API Error:', error); //para ver en consola del navegador
        return Promise.reject(error);
      }
    );
  }

  public getInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

export const axiosClient = new AxiosClient().getInstance();
