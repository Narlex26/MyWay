import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Publication, Comment } from '../../models';
import { PublicationService } from '../../services/publication.service';
import { CommentService } from '../../services/comment.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-publication-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="container mt-4">
      <a routerLink="/" class="btn btn-outline-secondary mb-4">← Retour</a>

      <div *ngIf="loading" class="text-center">
        <p>Chargement de la publication...</p>
      </div>

      <div *ngIf="error" class="alert alert-danger">
        {{ error }}
      </div>

      <div *ngIf="publication">
        <h1>{{ publication.title }}</h1>
        <div class="mb-3">
          <span class="badge bg-info me-2">{{ publication.location }}</span>
          <small class="text-muted">Par {{ publication.author_name }} • {{ publication.created_at | date:'dd/MM/yyyy' }}</small>
        </div>

        <div class="publication-content mb-5">
          <p>{{ publication.content }}</p>
        </div>

        <hr>

        <div class="comments-section mt-4">
          <h3>Commentaires ({{ comments.length }})</h3>

          <!-- Formulaire pour ajouter un commentaire - visible uniquement si connecté -->
          <div *ngIf="isLoggedIn" class="card mb-4">
            <div class="card-body">
              <h5 class="card-title">Ajouter un commentaire</h5>
              <form [formGroup]="commentForm" (ngSubmit)="onSubmitComment()">
                <div class="mb-3">
                  <textarea
                    class="form-control"
                    formControlName="content"
                    rows="3"
                    placeholder="Partagez votre avis..."
                  ></textarea>
                  <div *ngIf="commentForm.get('content')?.invalid && commentForm.get('content')?.touched" class="text-danger">
                    Veuillez saisir un commentaire.
                  </div>
                </div>
                <button type="submit" class="btn btn-primary" [disabled]="commentForm.invalid || submitting">
                  {{ submitting ? 'Envoi en cours...' : 'Publier' }}
                </button>
              </form>
            </div>
          </div>

          <!-- Message d'invitation à se connecter si non connecté -->
          <div *ngIf="!isLoggedIn" class="alert alert-info mb-4">
            <i class="fas fa-info-circle me-2"></i>
            <a routerLink="/login" class="alert-link">Connectez-vous</a> pour ajouter un commentaire.
          </div>

          <!-- Liste des commentaires -->
          <div *ngIf="comments.length === 0" class="text-center my-4">
            <p>Aucun commentaire pour le moment. Soyez le premier à commenter !</p>
          </div>

          <div *ngFor="let comment of comments" class="card mb-3">
            <div class="card-body">
              <p class="card-text">{{ comment.content }}</p>
              <div class="d-flex justify-content-between">
                <small class="text-muted">Par {{ comment.author_name }}</small>
                <small class="text-muted">{{ comment.created_at | date:'dd/MM/yyyy HH:mm' }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .publication-content {
      font-size: 1.1rem;
      line-height: 1.7;
    }

    .comments-section {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
    }
  `]
})
export class PublicationDetailComponent implements OnInit {
  publication: Publication | null = null;
  comments: Comment[] = [];
  loading = true;
  error = '';
  commentForm: FormGroup;
  submitting = false;
  isLoggedIn = false;
  currentUser: any = null;

  constructor(
    private route: ActivatedRoute,
    private publicationService: PublicationService,
    private commentService: CommentService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.commentForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    // Vérifier si l'utilisateur est connecté
    this.authService.user$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.currentUser = user;
    });

    // Charger les données de la publication
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPublication(+id);
    } else {
      this.error = 'Publication non trouvée';
      this.loading = false;
    }
  }

  loadPublication(id: number): void {
    this.publicationService.getPublication(id).subscribe({
      next: (data) => {
        this.publication = data;
        this.loadComments(id);
      },
      error: (err) => {
        this.error = 'Une erreur est survenue lors du chargement de la publication.';
        console.error('Erreur de chargement de la publication:', err);
        this.loading = false;
      }
    });
  }

  loadComments(publicationId: number): void {
    this.commentService.getCommentsByPublication(publicationId).subscribe({
      next: (data) => {
        this.comments = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Une erreur est survenue lors du chargement des commentaires.';
        console.error('Erreur de chargement des commentaires:', err);
        this.loading = false;
      }
    });
  }

  onSubmitComment(): void {
    if (this.commentForm.invalid || !this.publication || !this.isLoggedIn) return;

    this.submitting = true;
    const newComment: Comment = {
      content: this.commentForm.value.content,
      publication_id: this.publication.id
    } as Comment;

    this.commentService.createComment(newComment).subscribe({
      next: (comment) => {
        // Ajouter le nouveau commentaire au début de la liste
        this.comments.unshift(comment);
        this.commentForm.reset();
        this.submitting = false;
      },
      error: (err) => {
        console.error('Erreur lors de l\'ajout du commentaire:', err);
        this.submitting = false;
        // Si l'erreur est due à un problème d'authentification, rediriger vers la page de connexion
        if (err.status === 401) {
          this.error = 'Vous devez être connecté pour ajouter un commentaire.';
        } else {
          this.error = 'Une erreur est survenue lors de l\'ajout du commentaire.';
        }
      }
    });
  }
}
