import { Component } from '@angular/core';
import {MatButtonModule} from "@angular/material/button";
import {MatToolbar} from "@angular/material/toolbar";
import {MatIconModule} from '@angular/material/icon';
import {RouterLink, Router} from '@angular/router';
import {AuthService} from '../../Auth/services/auth.service';
import {NgIf} from '@angular/common';
import {MatMenuModule} from '@angular/material/menu';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatToolbar,
    RouterLink,
    NgIf,
  ],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.css'
})
export class ToolbarComponent {
  userName = '';
  businessName = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName = user.name;
      this.businessName = user.businessName;
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
