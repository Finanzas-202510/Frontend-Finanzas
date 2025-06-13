import { Routes } from '@angular/router';
import { DashboardComponent} from './dashboard.component/dashboard.component';
import { NuevoBonoComponent} from './Bonos/nuevo-bono.component/nuevo-bono.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'nuevo-bono', component: NuevoBonoComponent },
];
