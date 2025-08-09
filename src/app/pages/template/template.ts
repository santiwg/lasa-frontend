import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../../components/nav-bar/nav-bar';
import { GlobalStatusService } from '../../services/global-status-service';

@Component({
  selector: 'app-template',
  imports: [RouterOutlet, Navbar],
  templateUrl: './template.html',
  styleUrl: './template.css',
})
export class TemplateComponent {
  constructor(private globalStatusService: GlobalStatusService) {}

  isLoading(): boolean {
    return this.globalStatusService.isLoading();
  }
}