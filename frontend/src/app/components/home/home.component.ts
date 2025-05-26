import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Publication } from '../../models';
import { PublicationService } from '../../services/publication.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mt-4">
      <h1>Découvrez les voyages partagés</h1>

      <div class="row mt-4">
        <div *ngIf="loading" class="col-12 text-center">
          <p>Chargement des publications...</p>
        </div>

        <div *ngIf="error" class="col-12 alert alert-danger">
          {{ error }}
        </div>

        <div *ngIf="!loading && !error && publications.length === 0" class="col-12">
          <p>Aucune publication trouvée.</p>
        </div>

        <div *ngFor="let publication of publications" class="col-md-6 col-lg-4 mb-4">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">{{ publication.title }}</h5>
              <h6 class="card-subtitle mb-2 text-muted">{{ publication.location }}</h6>
              <p class="card-text">{{ publication.content | slice:0:150 }}...</p>
              <div class="d-flex justify-content-between">
                <small class="text-muted">Par {{ publication.author_name }}</small>
                <a [routerLink]="['/publications', publication.id]" class="card-link">Voir plus</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      transition: transform 0.3s;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .card:hover {
      transform: translateY(-5px);
    }
  `]
})
export class HomeComponent implements OnInit {
  publications: Publication[] = [];
  loading = true;
  error = '';

  constructor(private publicationService: PublicationService) {}

  ngOnInit(): void {
    this.loadPublications();
  }

  loadPublications(): void {
    this.publicationService.getPublications().subscribe({
      next: (data) => {
        this.publications = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Une erreur est survenue lors du chargement des publications.';
        console.error('Erreur de chargement des publications:', err);
        this.loading = false;
      }
    });
  }
}
