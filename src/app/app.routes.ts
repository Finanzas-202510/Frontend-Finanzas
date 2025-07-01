import { Routes } from '@angular/router';
import { DashboardComponent} from './dashboard.component/dashboard.component';
import { NuevoBonoComponent} from './Bonos/nuevo-bono.component/nuevo-bono.component';
import { BonosVistaComponent } from './Bonos/bonos-vista.component/bonos-vista.component';
import { BonoEditarComponent} from './Bonos/bonos-editar.component/bonos-editar.component';
import {LoginComponent} from './Auth/pages/login.component/login.component';
import {RegisterComponent} from './Auth/pages/register.component/register.component';
import {LoginGuard} from './Auth/services/login-guard';
import {AuthGuard} from './Auth/services/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path:'login', component: LoginComponent, canActivate: [LoginGuard] },
  { path:'register', component: RegisterComponent, canActivate: [LoginGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'nuevo-bono', component: NuevoBonoComponent , canActivate: [AuthGuard] },
  { path: 'vista-bono/:id', component: BonosVistaComponent , canActivate: [AuthGuard] },
  { path: 'vista-bono/editar/:id', component: BonoEditarComponent , canActivate: [AuthGuard] },
];
