import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-services-maintenance',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="services-page">
      <nav class="navbar">
        <div class="container">
          <div class="nav-brand">
            <div class="logo">
              <img src="/assets/logoFinal.png" alt="DGSI Logo" class="logo-image">
            </div>
          </div>
          <div class="nav-actions">
            <a routerLink="/" class="btn btn-outline">Retour à l'accueil</a>
          </div>
        </div>
      </nav>

      <main class="main-content">
        <div class="container">
          <div class="services-header">
            <h1>Suivi de prestation de maintenance</h1>
            <p class="subtitle">Direction Générale des Systèmes d'Information</p>
          </div>

          <div class="services-content">
            <section class="overview-section">
              <h2>Notre approche de la maintenance informatique</h2>
              <p>
                La DGSI assure un suivi rigoureux et professionnel des prestations de maintenance
                informatique pour garantir la continuité et la performance des systèmes d'information
                du Ministère des Finances et du Budget.
              </p>
            </section>

            <section class="services-grid-section">
              <h2>Nos services de maintenance</h2>
              <div class="services-grid">
                <div class="service-card">
                  <div class="service-icon">🖥️</div>
                  <h3>Maintenance préventive</h3>
                  <p>
                    Interventions régulières pour prévenir les pannes et optimiser
                    les performances des équipements informatiques.
                  </p>
                  <ul class="service-features">
                    <li>Nettoyage et dépoussiérage</li>
                    <li>Mise à jour logicielle</li>
                    <li>Contrôle des performances</li>
                    <li>Prévention des pannes</li>
                  </ul>
                </div>

                <div class="service-card">
                  <div class="service-icon">🔧</div>
                  <h3>Maintenance corrective</h3>
                  <p>
                    Réparation rapide et efficace des équipements défaillants
                    pour minimiser les interruptions de service.
                  </p>
                  <ul class="service-features">
                    <li>Diagnostic rapide</li>
                    <li>Réparation sur site</li>
                    <li>Remplacement de pièces</li>
                    <li>Tests de fonctionnement</li>
                  </ul>
                </div>

                <div class="service-card">
                  <div class="service-icon">📊</div>
                  <h3>Maintenance évolutive</h3>
                  <p>
                    Adaptation des systèmes aux nouveaux besoins et technologies
                    pour une évolution continue.
                  </p>
                  <ul class="service-features">
                    <li>Mise à niveau matérielle</li>
                    <li>Optimisation logicielle</li>
                    <li>Intégration nouvelles fonctionnalités</li>
                    <li>Formation utilisateurs</li>
                  </ul>
                </div>

                <div class="service-card">
                  <div class="service-icon">🛡️</div>
                  <h3>Maintenance de sécurité</h3>
                  <p>
                    Protection continue contre les menaces informatiques
                    et sécurisation des données sensibles.
                  </p>
                  <ul class="service-features">
                    <li>Mise à jour sécurité</li>
                    <li>Antivirus et antimalware</li>
                    <li>Sauvegarde et restauration</li>
                    <li>Audit de sécurité</li>
                  </ul>
                </div>
              </div>
            </section>

            <section class="process-section">
              <h2>Notre processus de maintenance</h2>
              <div class="process-steps">
                <div class="process-step">
                  <div class="step-number">1</div>
                  <h3>Évaluation initiale</h3>
                  <p>Analyse complète des besoins et diagnostic de l'état des équipements.</p>
                </div>

                <div class="process-step">
                  <div class="step-number">2</div>
                  <h3>Planification</h3>
                  <p>Élaboration d'un plan de maintenance personnalisé selon vos besoins.</p>
                </div>

                <div class="process-step">
                  <div class="step-number">3</div>
                  <h3>Intervention</h3>
                  <p>Exécution des travaux de maintenance par nos techniciens qualifiés.</p>
                </div>

                <div class="process-step">
                  <div class="step-number">4</div>
                  <h3>Contrôle qualité</h3>
                  <p>Vérification et validation de la conformité des interventions réalisées.</p>
                </div>

                <div class="process-step">
                  <div class="step-number">5</div>
                  <h3>Suivi et rapport</h3>
                  <p>Évaluation continue et reporting détaillé des prestations effectuées.</p>
                </div>
              </div>
            </section>

            <section class="benefits-section">
              <h2>Avantages de nos services</h2>
              <div class="benefits-grid">
                <div class="benefit-item">
                  <div class="benefit-icon">⚡</div>
                  <h3>Rapidité d'intervention</h3>
                  <p>Interventions rapides pour minimiser les interruptions de service.</p>
                </div>

                <div class="benefit-item">
                  <div class="benefit-icon">🎯</div>
                  <h3>Précision technique</h3>
                  <p>Techniciens hautement qualifiés et expérimentés.</p>
                </div>

                <div class="benefit-item">
                  <div class="benefit-icon">📋</div>
                  <h3>Traçabilité complète</h3>
                  <p>Suivi rigoureux de toutes les interventions réalisées.</p>
                </div>

                <div class="benefit-item">
                  <div class="benefit-icon">🔒</div>
                  <h3>Sécurité garantie</h3>
                  <p>Protection des données et confidentialité assurée.</p>
                </div>

                <div class="benefit-item">
                  <div class="benefit-icon">💰</div>
                  <h3>Coût optimisé</h3>
                  <p>Solutions économiques adaptées à vos besoins.</p>
                </div>

                <div class="benefit-item">
                  <div class="benefit-icon">🤝</div>
                  <h3>Support continu</h3>
                  <p>Accompagnement et support technique permanent.</p>
                </div>
              </div>
            </section>

            <section class="cta-section">
              <div class="cta-content">
                <h2>Prêt à bénéficier de nos services ?</h2>
                <p>
                  Contactez-nous pour discuter de vos besoins en maintenance informatique
                  et bénéficier d'un service professionnel et adapté à vos exigences.
                </p>
                <div class="cta-buttons">
                  <a routerLink="/contact" class="btn btn-primary">Nous contacter</a>
                  <a (click)="login()" class="btn btn-outline">Accéder à la plateforme</a>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .services-page {
      min-height: 100vh;
      background: #f8fafc;
    }

    .navbar {
      background: rgba(30, 41, 59, 0.9);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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

    .services-header {
      text-align: center;
      margin-bottom: 4rem;
    }

    .services-header h1 {
      font-size: 3rem;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 1rem;
    }

    .subtitle {
      font-size: 1.25rem;
      color: #64748b;
      font-weight: 500;
    }

    .services-content section {
      margin-bottom: 4rem;
    }

    .services-content h2 {
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

    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }

    .service-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      text-align: center;
      transition: transform 0.2s ease;
    }

    .service-card:hover {
      transform: translateY(-4px);
    }

    .service-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .service-card h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 1rem;
    }

    .service-card p {
      color: #64748b;
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }

    .service-features {
      list-style: none;
      padding: 0;
      margin: 0;
      text-align: left;
    }

    .service-features li {
      color: #475569;
      margin-bottom: 0.5rem;
      padding-left: 1rem;
      position: relative;
    }

    .service-features li::before {
      content: '✓';
      color: var(--primary);
      font-weight: bold;
      position: absolute;
      left: 0;
    }

    .process-steps {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }

    .process-step {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      text-align: center;
      position: relative;
    }

    .step-number {
      width: 3rem;
      height: 3rem;
      background: var(--primary);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      font-weight: 700;
      margin: 0 auto 1rem auto;
    }

    .process-step h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 1rem;
    }

    .process-step p {
      color: #64748b;
      line-height: 1.6;
      margin: 0;
    }

    .benefits-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }

    .benefit-item {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      text-align: center;
      transition: transform 0.2s ease;
    }

    .benefit-item:hover {
      transform: translateY(-2px);
    }

    .benefit-icon {
      font-size: 2rem;
      margin-bottom: 1rem;
    }

    .benefit-item h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 0.5rem;
    }

    .benefit-item p {
      color: #64748b;
      line-height: 1.5;
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
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }

    .cta-content p {
      font-size: 1.125rem;
      color: #e2e8f0;
      max-width: 600px;
      margin: 0 auto 2rem auto;
      line-height: 1.6;
    }

    .cta-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .cta-buttons .btn {
      padding: 0.875rem 2rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .cta-buttons .btn-primary {
      background-color: var(--primary);
      color: white;
      border: 1px solid var(--primary);
    }

    .cta-buttons .btn-primary:hover {
      background-color: #ea580c;
      transform: translateY(-1px);
    }

    .cta-buttons .btn-outline {
      background-color: transparent;
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .cta-buttons .btn-outline:hover {
      background-color: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.5);
    }

    @media (max-width: 768px) {
      .container {
        padding: 0 1rem;
      }

      .services-header h1 {
        font-size: 2rem;
      }

      .services-grid,
      .process-steps,
      .benefits-grid {
        grid-template-columns: 1fr;
      }

      .cta-buttons {
        flex-direction: column;
        align-items: center;
      }

      .cta-buttons .btn {
        width: 100%;
        max-width: 300px;
      }
    }
  `]
})
export class ServicesMaintenanceComponent {
  constructor(private authService: AuthService) {}

  login(): void {
    this.authService.login();
  }
}