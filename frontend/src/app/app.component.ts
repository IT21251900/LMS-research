import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {AdminLayoutComponent} from "./layout/admin-layout/admin-layout.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AdminLayoutComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'admin-web';
}
