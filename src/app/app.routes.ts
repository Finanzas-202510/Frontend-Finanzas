import { Routes } from '@angular/router';
import { DashboardComponent} from './dashboard.component/dashboard.component';
import { NuevoBonoComponent} from './Bonos/nuevo-bono.component/nuevo-bono.component';
import { BonosVistaComponent } from './Bonos/bonos-vista.component/bonos-vista.component';
import { BonoEditarComponent} from './Bonos/bonos-editar.component/bonos-editar.component';
import {LoginComponent} from './Auth/pages/login.component/login.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path:'login', component: LoginComponent},
  { path: 'dashboard', component: DashboardComponent },
  { path: 'nuevo-bono', component: NuevoBonoComponent },
  { path: 'vista-bono/:id', component: BonosVistaComponent },
  { path: 'vista-bono/editar/:id', component: BonoEditarComponent },
];
