import { Injectable } from '@angular/core';
import { config } from '../config/env';
import { axiosClient } from './axios-client';

@Injectable({
  providedIn: 'root'
})
export class AuthService{
    constructor() { }
    private baseUrl = config.urls.users;
    async login(email:string,password:string):Promise<{ success: true; data: any}| {success: false; error: string} >{
        try {
            const response = await axiosClient.post(`${this.baseUrl}/login`, {
                email,
                password
            });
            return { success: true, data: response.data}
            }

        catch (error: any) { 
            const message =
                error.response?.data?.message ||  // si existe un mensaje de error que manda el backend lo uso
                error.message ||                  // mensaje generado por Axios
                "Unknown Error";                  // por si no se obtiene
            return { success: false, error: message };
        }
    } 
    /*async register(email:string,password:string):Promise<{success:true}|{ success: false; error: string}>{
        try {
            const response = await axiosService.post(`${config.urls.auth}/register`, {
                email,
                password
            });
            return { success: true}
            }

        catch (error: any) { 
            const message =
                error.response?.data?.message ||  // si existe un mensaje de error que manda el backend lo uso
                error.message ||                  // mensaje generado por Axios
                "Unknown Error";                  // por si no se obtiene
            return { success: false, error: message };
        }
    }*/
}