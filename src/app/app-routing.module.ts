import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { VoiceRecordComponent } from './components/voice-record/voice-record.component';
import { InicioComponent } from './components/inicio/inicio.component';
import { RegisterComponent } from './components/register/register.component';
import { Pagina404Component } from './components/pagina404/pagina404.component';
import { AuthGuard } from 'src/app/auth/auth.guard';

const routes: Routes = [
  { path:'',redirectTo: '/inicio', pathMatch: 'full' },
  { path:'inicio', component: InicioComponent },
  { path:'register', component: RegisterComponent },
  { path: 'application', component: VoiceRecordComponent, canActivate: [AuthGuard] },
  { path:'**', component: Pagina404Component }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
