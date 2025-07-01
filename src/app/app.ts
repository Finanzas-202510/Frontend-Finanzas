import { Component } from '@angular/core';
import {Router, RouterOutlet} from '@angular/router';
import { ToolbarComponent} from './Shared/toolbar.component/toolbar.component';
import {NgIf} from '@angular/common';


@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    ToolbarComponent,
    NgIf,
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected title = 'Frontend-Finanzas';
  constructor(public router: Router) {}
}
