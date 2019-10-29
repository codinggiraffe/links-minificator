import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {RedirectComponent} from './redirect/redirect.component';
import {HomeComponent} from './home/home.component';
import {StatisticsComponent} from './statistics/statistics.component';
import {LoginComponent} from './login/login.component';
import {SignupComponent} from './signup/signup.component';
import {AuthGuard} from './auth.guard';


const routes: Routes = [
  { path: '', component: HomeComponent},
  { path: 'statistics', component: StatisticsComponent, canActivate: [AuthGuard]},
  { path: 'login', component: LoginComponent},
  { path: 'signup', component: SignupComponent},
  { path: ':short_link', component: RedirectComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
