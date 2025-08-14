import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon, SweetAlertOptions } from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class AlertService {
  async confirm(options?: Partial<SweetAlertOptions>): Promise<boolean> {
    const defaultOptions = {
      title: '¿Estás seguro?',
      icon: 'question',
      showDenyButton: true,
      confirmButtonText: '¡Sí, adelante!',
      confirmButtonColor: 'var(--color-accent-primary)',
      denyButtonText: 'No, volvé',
    };
    const mergedOptions = { ...defaultOptions, ...options };
    const result = await Swal.fire(mergedOptions as any);
    return result.isConfirmed;
  }

  async success(message: string, title?: string): Promise<void> {
    await Swal.fire({
      title: title ?? '¡Éxito!',
      text: message,
      icon: 'success',
      confirmButtonColor: 'var(--color-accent-primary)'
    });
  }

  async error(message: string, title?: string): Promise<void> {
    await Swal.fire({
      title: title ?? 'Error',
      text: message,
      icon: 'error',
      confirmButtonColor: 'var(--color-accent-primary)'
    });
  }

  async info(message: string, title?: string): Promise<void> {
    await Swal.fire({
      title: title ?? 'Información',
      text: message,
      icon: 'info',
      confirmButtonColor: 'var(--color-accent-primary)'
    });
  }
}
