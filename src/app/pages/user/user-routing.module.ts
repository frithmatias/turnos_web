import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeUserComponent } from './home-user/home-user.component';
import { NopagefoundComponent } from '../nopagefound/nopagefound.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DesktopsComponent } from './desktops/desktops.component';
import { AssistantsComponent } from './assistants/assistants.component';

const userRoutes: Routes = [
  { path: 'home', component: HomeUserComponent },
  { path: 'desktops', component: DesktopsComponent },
  { path: 'assistants', component: AssistantsComponent },
  { path: 'dashboard', component: DashboardComponent },
	{ path: '', redirectTo: '/user/home', pathMatch: 'full' },
  { path: '**', component: NopagefoundComponent}

];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(userRoutes)], 
  exports: [RouterModule]
})
export class UserRoutingModule { }