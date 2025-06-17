import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DashboardComponent} from './dashboard.component/dashboard.component';
import { ToolbarComponent} from './Shared/toolbar.component/toolbar.component';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet,
    ToolbarComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'Frontend-Finanzas';
}
