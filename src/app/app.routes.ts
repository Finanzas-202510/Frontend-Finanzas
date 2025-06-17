import { Routes } from '@angular/router';
import { DashboardComponent} from './dashboard.component/dashboard.component';
import { NuevoBonoComponent} from './Bonos/nuevo-bono.component/nuevo-bono.component';
import { BonosVistaComponent } from './Bonos/bonos-vista.component/bonos-vista.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'nuevo-bono', component: NuevoBonoComponent },
  { path: 'vista-bono/:id', component: BonosVistaComponent },
];
