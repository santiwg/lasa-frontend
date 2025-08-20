import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import {jwtDecode} from 'jwt-decode';

export const canActivateFn: CanActivateFn = () => {
	const router = inject(Router);
	const token = localStorage.getItem('access_token');

	if (token) {
		try {
		const decoded: any = jwtDecode(token);
		const now = Date.now() / 1000; // tiempo actual en segundos (Unix timestamp), para comparar con la expiracion del token

		if (decoded.exp && decoded.exp > now) {
			return true; 
			
		}
		} catch (error) {
			console.error("Token inválido", error);
			localStorage.removeItem('access_token'); // Limpio token vencido o dañado
		}
	}
	//si no hay token o está vencido, redirijo al login
	router.navigate(['/login']);
	return false; 
};
