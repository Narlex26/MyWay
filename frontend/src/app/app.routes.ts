import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { PublicationDetailComponent } from './components/publication-detail/publication-detail.component';
import { CreatePublicationComponent } from './components/create-publication/create-publication.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'publications/:id', component: PublicationDetailComponent },
  { path: 'create', component: CreatePublicationComponent },
  { path: '**', redirectTo: '' }
];
