import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { PublicationDetailComponent } from './components/publication-detail/publication-detail.component';
import { CreatePublicationComponent } from './components/create-publication/create-publication.component';
import { LoginComponent } from './components/auth/login.component';
import { RegisterComponent } from './components/auth/register.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'publications/:id', component: PublicationDetailComponent },
  { path: 'create', component: CreatePublicationComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '**', redirectTo: '' }
];
