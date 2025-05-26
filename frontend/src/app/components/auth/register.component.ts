import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header bg-primary text-white">
              <h3 class="mb-0">Créer un compte</h3>
            </div>
            <div class="card-body">
              <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <label for="username" class="form-label">Nom d'utilisateur</label>
                  <input
                    type="text"
                    class="form-control"
                    id="username"
                    formControlName="username"
                    [ngClass]="{'is-invalid': submitted && f['username'].errors}"
                  >
                  <div *ngIf="submitted && f['username'].errors" class="invalid-feedback">
                    <div *ngIf="f['username'].errors['required']">Le nom d'utilisateur est requis</div>
                    <div *ngIf="f['username'].errors['minlength']">Le nom d'utilisateur doit contenir au moins 3 caractères</div>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input
                    type="email"
                    class="form-control"
                    id="email"
                    formControlName="email"
                    [ngClass]="{'is-invalid': submitted && f['email'].errors}"
                  >
                  <div *ngIf="submitted && f['email'].errors" class="invalid-feedback">
                    <div *ngIf="f['email'].errors['required']">L'email est requis</div>
                    <div *ngIf="f['email'].errors['email']">Veuillez entrer une adresse email valide</div>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="password" class="form-label">Mot de passe</label>
                  <input
                    type="password"
                    class="form-control"
                    id="password"
                    formControlName="password"
                    [ngClass]="{'is-invalid': submitted && f['password'].errors}"
                  >
                  <div *ngIf="submitted && f['password'].errors" class="invalid-feedback">
                    <div *ngIf="f['password'].errors['required']">Le mot de passe est requis</div>
                    <div *ngIf="f['password'].errors['minlength']">Le mot de passe doit contenir au moins 6 caractères</div>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="confirmPassword" class="form-label">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    class="form-control"
                    id="confirmPassword"
                    formControlName="confirmPassword"
                    [ngClass]="{'is-invalid': submitted && f['confirmPassword'].errors}"
                  >
                  <div *ngIf="submitted && f['confirmPassword'].errors" class="invalid-feedback">
                    <div *ngIf="f['confirmPassword'].errors['required']">La confirmation du mot de passe est requise</div>
                    <div *ngIf="f['confirmPassword'].errors['matching']">Les mots de passe ne correspondent pas</div>
                  </div>
                </div>

                <div *ngIf="error" class="alert alert-danger">
                  {{ error }}
                </div>

                <div class="d-grid gap-2">
                  <button type="submit" class="btn btn-primary" [disabled]="loading">
                    <span *ngIf="loading" class="spinner-border spinner-border-sm me-1"></span>
                    S'inscrire
                  </button>
                </div>
              </form>

              <div class="mt-3 text-center">
                <p>Vous avez déjà un compte ? <a routerLink="/login">Connectez-vous</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  submitted = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Getter pour un accès facile aux contrôles du formulaire
  get f() { return this.registerForm.controls; }

  // Validateur personnalisé pour vérifier que les mots de passe correspondent
  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    if (password === confirmPassword) {
      return null;
    }

    return { matching: true };
  }

  onSubmit() {
    this.submitted = true;
    this.error = '';

    // Si le formulaire est invalide, arrêter ici
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    const { username, email, password } = this.registerForm.value;

    this.authService.register(username, email, password).subscribe({
      next: (response) => {
        if (response) {
          this.router.navigate(['/']);
        } else {
          this.error = 'Erreur lors de l\'inscription';
          this.loading = false;
        }
      },
      error: (error) => {
        this.error = error?.error?.message || 'Erreur lors de l\'inscription';
        this.loading = false;
      }
    });
  }
}
