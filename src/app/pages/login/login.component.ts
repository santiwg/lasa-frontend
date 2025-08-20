import { Component } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { axiosClient } from '../../services/axios-client';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-login',
  imports: [RouterModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  formulario: FormGroup;
  error = '';
  constructor(private fb: FormBuilder, private router: Router,private authService: AuthService) {
	  this.formulario = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
	  password: ['', [Validators.required]]
	  });
  }

  async login() {
	  if (this.formulario.invalid) {
	    this.error = 'Completa todos los campos correctamente.';
	    return;
    }

    const { email, password } = this.formulario.value
      const response= await this.authService.login(email,password) 
      if (response.success){
        this.error = ''
        localStorage.setItem('access_token', response.data.accessToken)
        this.router.navigate([''])
      }else{
        this.error = response.error;
      }
  }
}
