import { Component } from '@angular/core';
import {MatButton} from "@angular/material/button";
import {MatToolbar} from "@angular/material/toolbar";
import {MatIcon} from '@angular/material/icon';
import {RouterLink} from '@angular/router';
import {AuthService} from '../../Auth/services/auth.service';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [
    MatButton,
    MatIcon,
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

  constructor(private authService: AuthService) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName = user.name;
      this.businessName = user.businessName;
    }
  }
}
