import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="reports-page">
      <nav class="navbar">
        <div class="container">
          <div class="nav-brand">
            <div class="logo">
              <a href="https://it.finances.bf/" target="_blank">
                <img src="/assets/logoFinal.png" alt="DGSI Logo" class="logo-image">
              </a>
            </div>
          </div>
          <div class="nav-actions">
            <a routerLink="/" class="btn btn-outline">Retour à l'accueil</a>
          </div>
        </div>
      </nav>

      <main class="main-content">
        <div class="container">
          <div class="service-header">
            <h1>Rapports et Évaluations</h1>
            <p class="subtitle">Découvrez notre système d'évaluation et de reporting des prestations de maintenance</p>
          </div>

          <div class="service-content">
            <section class="overview-section">
              <h2>Système d'évaluation transparent</h2>
              <p>
                Notre plateforme intègre un système complet d'évaluation des prestataires basé sur des critères
                objectifs et standardisés. Les rapports générés permettent un suivi rigoureux de la qualité
                des services et une amélioration continue des prestations.
              </p>
            </section>

            <section class="evaluation-section">
              <h2>Critères d'évaluation</h2>
              <div class="criteria-grid">
                <div class="criteria-card">
                  <div class="criteria-icon">⚡</div>
                  <h3>Réactivité</h3>
                  <p>Délais d'intervention et temps de résolution des incidents</p>
                </div>

                <div class="criteria-card">
                  <div class="criteria-icon">🎯</div>
                  <h3>Qualité technique</h3>
                  <p>Compétence technique et conformité aux normes</p>
                </div>

                <div class="criteria-card">
                  <div class="criteria-icon">🤝</div>
                  <h3>Relation client</h3>
                  <p>Communication et collaboration avec les services</p>
                </div>

                <div class="criteria-card">
                  <div class="criteria-icon">📋</div>
                  <h3>Documentation</h3>
                  <p>Qualité des rapports et documentation fournie</p>
                </div>

                <div class="criteria-card">
                  <div class="criteria-icon">🔒</div>
                  <h3>Sécurité</h3>
                  <p>Respect des protocoles de sécurité informatique</p>
                </div>

                <div class="criteria-card">
                  <div class="criteria-icon">📈</div>
                  <h3>Performance</h3>
                  <p>Efficacité globale et taux de disponibilité des services</p>
                </div>
              </div>
            </section>

            <section class="reports-section">
              <h2>Types de rapports générés</h2>
              <div class="reports-grid">
                <div class="report-card">
                  <div class="report-icon">📊</div>
                  <h3>Rapport trimestriel</h3>
                  <p>Évaluation détaillée des performances sur un trimestre avec statistiques complètes</p>
                  <ul>
                    <li>Analyse des interventions réalisées</li>
                    <li>Taux de satisfaction des services</li>
                    <li>Recommandations d'amélioration</li>
                  </ul>
                </div>

                <div class="report-card">
                  <div class="report-icon">📈</div>
                  <h3>Rapport annuel</h3>
                  <p>Bilan annuel complet des prestations avec tendances et projections</p>
                  <ul>
                    <li>Synthèse des évaluations trimestrielles</li>
                    <li>Évolution des performances</li>
                    <li>Plan d'action pour l'année suivante</li>
                  </ul>
                </div>

                <div class="report-card">
                  <div class="report-icon">📋</div>
                  <h3>Rapport d'intervention</h3>
                  <p>Compte-rendu détaillé de chaque intervention de maintenance</p>
                  <ul>
                    <li>Description du problème</li>
                    <li>Solution apportée</li>
                    <li>Temps d'intervention</li>
                  </ul>
                </div>

                <div class="report-card">
                  <div class="report-icon">⭐</div>
                  <h3>Bulletin d'évaluation</h3>
                  <p>Évaluation individuelle des prestataires selon les critères définis</p>
                  <ul>
                    <li>Note globale et par critère</li>
                    <li>Commentaires détaillés</li>
                    <li>Points forts et axes d'amélioration</li>
                  </ul>
                </div>
              </div>
            </section>

            <section class="benefits-section">
              <h2>Avantages du système d'évaluation</h2>
              <div class="benefits-list">
                <div class="benefit-item">
                  <div class="benefit-icon">✅</div>
                  <div>
                    <h3>Objectivité</h3>
                    <p>Critères d'évaluation standardisés et transparents pour tous les prestataires</p>
                  </div>
                </div>

                <div class="benefit-item">
                  <div class="benefit-icon">📊</div>
                  <div>
                    <h3>Suivi des performances</h3>
                    <p>Tableaux de bord permettant un suivi en temps réel des indicateurs clés</p>
                  </div>
                </div>

                <div class="benefit-item">
                  <div class="benefit-icon">🎯</div>
                  <div>
                    <h3>Amélioration continue</h3>
                    <p>Identification des axes d'amélioration et mise en place d'actions correctives</p>
                  </div>
                </div>

                <div class="benefit-item">
                  <div class="benefit-icon">🤝</div>
                  <div>
                    <h3>Transparence</h3>
                    <p>Accès aux rapports pour tous les acteurs concernés (prestataires, services, administration)</p>
                  </div>
                </div>
              </div>
            </section>

            <section class="cta-section">
              <div class="cta-content">
                <h2>Accédez à vos rapports</h2>
                <p>Connectez-vous pour consulter vos évaluations et rapports de performance</p>
                <div class="cta-buttons">
                  <a (click)="login()" class="btn btn-primary">Accéder à mes rapports</a>
                  <a (click)="register()" class="btn btn-outline">Devenir prestataire</a>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .reports-page {
      min-height: 100vh;
      background: #f8fafc;
    }

    .navbar {
      background: linear-gradient(135deg, #0a192f 0%, #0d1b2a 100%);
      border-bottom: 1px solid #1e293b;
      color: white;
      padding: 1rem 0;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .navbar .container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .logo-image {
      width: 4rem;
      height: 4rem;
      border-radius: var(--radius);
      object-fit: contain;
    }

    .nav-actions .btn {
      text-decoration: none;
      background-color: transparent;
      border: 1px solid rgba(249, 115, 22, 0.6);
      color: var(--primary);
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .nav-actions .btn:hover {
      background-color: var(--primary);
      color: white;
    }

    .main-content {
      padding: 4rem 0;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .service-header {
      text-align: center;
      margin-bottom: 4rem;
    }

    .service-header h1 {
      font-size: 3rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 1rem;
    }

    .subtitle {
      font-size: 1.25rem;
      color: #64748b;
      font-weight: 500;
      max-width: 600px;
      margin: 0 auto;
    }

    .service-content section {
      margin-bottom: 4rem;
    }

    .service-content h2 {
      font-size: 2rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 2rem;
      text-align: center;
    }

    .overview-section p {
      font-size: 1.125rem;
      line-height: 1.7;
      color: #475569;
      max-width: 800px;
      margin: 0 auto;
      text-align: center;
    }

    .criteria-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }

    .criteria-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      text-align: center;
      transition: transform 0.2s ease;
    }

    .criteria-card:hover {
      transform: translateY(-4px);
    }

    .criteria-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .criteria-card h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 1rem;
    }

    .criteria-card p {
      color: #64748b;
      line-height: 1.6;
    }

    .reports-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }

    .report-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      transition: transform 0.2s ease;
    }

    .report-card:hover {
      transform: translateY(-4px);
    }

    .report-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      text-align: center;
    }

    .report-card h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 1rem;
      text-align: center;
    }

    .report-card p {
      color: #64748b;
      line-height: 1.6;
      margin-bottom: 1rem;
      text-align: center;
    }

    .report-card ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .report-card li {
      color: #64748b;
      margin-bottom: 0.5rem;
      padding-left: 1rem;
      position: relative;
    }

    .report-card li::before {
      content: "•";
      color: var(--primary);
      font-weight: bold;
      position: absolute;
      left: 0;
    }

    .benefits-list {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      margin-top: 2rem;
    }

    .benefit-item {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      display: flex;
      align-items: center;
      gap: 1.5rem;
      transition: transform 0.2s ease;
    }

    .benefit-item:hover {
      transform: translateY(-2px);
    }

    .benefit-icon {
      font-size: 2rem;
      width: 3rem;
      text-align: center;
    }

    .benefit-item h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 0.5rem;
    }

    .benefit-item p {
      color: #64748b;
      line-height: 1.6;
      margin: 0;
    }

    .cta-section {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      color: white;
      padding: 4rem 2rem;
      border-radius: 16px;
      text-align: center;
    }

    .cta-content h2 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }

    .cta-content p {
      font-size: 1.25rem;
      color: #e2e8f0;
      margin-bottom: 2rem;
    }

    .cta-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .cta-buttons .btn {
      padding: 1rem 2rem;
      font-size: 1.125rem;
      font-weight: 600;
      border-radius: 8px;
      text-decoration: none;
      transition: all 0.3s ease;
    }

    .cta-buttons .btn-primary {
      background: var(--primary);
      border: 1px solid var(--primary);
      color: white;
    }

    .cta-buttons .btn-primary:hover {
      background: #ea580c;
      transform: translateY(-2px);
    }

    .cta-buttons .btn-outline {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.6);
      color: white;
    }

    .cta-buttons .btn-outline:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: white;
    }

    @media (max-width: 768px) {
      .container {
        padding: 0 1rem;
      }

      .service-header h1 {
        font-size: 2rem;
      }

      .criteria-grid,
      .reports-grid {
        grid-template-columns: 1fr;
      }

      .benefit-item {
        flex-direction: column;
        text-align: center;
      }

      .cta-buttons {
        flex-direction: column;
        align-items: center;
      }

      .cta-content h2 {
        font-size: 2rem;
      }
    }
  `]
})
export class ReportsComponent {
  constructor(private authService: AuthService) {}

  login(): void {
    this.authService.login();
  }

  register(): void {
    // Since we're using Keycloak, redirect to Keycloak registration
    const isProduction = window.location.protocol === 'https:';
    const issuer = isProduction
      ? 'https://your-keycloak-domain.com/realms/Maintenance-DGSI'
      : 'http://localhost:8080/realms/Maintenance-DGSI';
    const clientId = 'maintenance-app';
    const redirectUri = encodeURIComponent(window.location.origin + '/');
    const registrationUrl = `${issuer}/protocol/openid-connect/registrations?client_id=${clientId}&redirect_uri=${redirectUri}`;
    window.location.href = registrationUrl;
  }
}