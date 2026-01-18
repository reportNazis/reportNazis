import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Root application component for the frontend-admin app.
 * Uses standalone component architecture per Angular 21+ best practices.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'frontend-admin';
}
