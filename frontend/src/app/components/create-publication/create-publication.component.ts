import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PublicationService } from '../../services/publication.service';

@Component({
  selector: 'app-create-publication',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="container mt-4">
      <h1>Partagez votre voyage</h1>

      <div class="card mt-4">
        <div class="card-body">
          <form [formGroup]="publicationForm" (ngSubmit)="onSubmit()">
            <div class="mb-3">
              <label for="title" class="form-label">Titre</label>
              <input
                type="text"
                class="form-control"
                id="title"
                formControlName="title"
                placeholder="Titre de votre voyage"
              >
              <div *ngIf="publicationForm.get('title')?.invalid && publicationForm.get('title')?.touched" class="text-danger">
                Le titre est obligatoire (3 caractères minimum).
              </div>
            </div>

            <div class="mb-3">
              <label for="location" class="form-label">Lieu</label>
              <input
                type="text"
                class="form-control"
                id="location"
                formControlName="location"
                placeholder="Où êtes-vous allé(e) ?"
              >
            </div>

            <div class="mb-3">
              <label for="content" class="form-label">Contenu</label>
              <textarea
                class="form-control"
                id="content"
                formControlName="content"
                rows="8"
                placeholder="Partagez votre expérience..."
              ></textarea>
              <div *ngIf="publicationForm.get('content')?.invalid && publicationForm.get('content')?.touched" class="text-danger">
                Le contenu est obligatoire (10 caractères minimum).
              </div>
            </div>

            <div class="d-flex justify-content-between">
              <button type="button" class="btn btn-outline-secondary" routerLink="/">Annuler</button>
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="publicationForm.invalid || submitting"
              >
                {{ submitting ? 'Publication en cours...' : 'Publier' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    textarea {
      min-height: 150px;
    }
  `]
})
export class CreatePublicationComponent {
  publicationForm: FormGroup;
  submitting = false;

  // Utilisateur temporaire (à remplacer par un système d'authentification plus tard)
  currentUserId = 1;

  constructor(
    private fb: FormBuilder,
    private publicationService: PublicationService,
    private router: Router
  ) {
    this.publicationForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      location: [''],
      content: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit(): void {
    if (this.publicationForm.invalid) return;

    this.submitting = true;
    const publication = {
      ...this.publicationForm.value,
      user_id: this.currentUserId
    };

    this.publicationService.createPublication(publication).subscribe({
      next: (newPublication) => {
        this.router.navigate(['/publications', newPublication.id]);
      },
      error: (err) => {
        console.error('Erreur lors de la création de la publication :', err);
        this.submitting = false;
        alert('Une erreur est survenue lors de la publication. Veuillez réessayer.');
      }
    });
  }
}
