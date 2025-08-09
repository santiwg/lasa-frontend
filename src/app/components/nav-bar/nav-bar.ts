import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.css'
})
export class Navbar {
    isCollapsed = true;

    toggleNavbar() {
      this.isCollapsed = !this.isCollapsed;
  }
}
