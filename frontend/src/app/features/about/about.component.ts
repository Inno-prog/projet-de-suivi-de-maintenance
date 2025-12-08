import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="about-page">
      <nav class="navbar">
        <div class="container">
          <div class="nav-brand">
            <div class="logo">
              <img src="/assets/logoFinal.png" alt="DGSI Logo" class="logo-image">
            </div>
          </div>

          <div class="nav-menu">
            <div class="nav-item">
              <a routerLink="/about" class="nav-link">À propos</a>
            </div>
            <div class="nav-item">
              <a href="https://www.finances.gov.bf" target="_blank" class="nav-link">Ministère</a>
            </div>
          </div>

          <div class="nav-actions">
            <a routerLink="/" class="btn btn-outline">Retour à l'accueil</a>
          </div>
        </div>
      </nav>

      <main class="main-content">
        <div class="container">
          <div class="about-header">
            <h1>Qui sommes-nous ?</h1>
            <p class="subtitle">Direction Générale des Systèmes d'Information</p>
          </div>

          <div class="about-content">
            <section class="mission-section">
              <h2>Notre Mission</h2>
              <p>
                La Direction Générale des Systèmes d'Information (DGSI) est chargée de la conception,
                du développement et de la maintenance des systèmes d'information du Ministère des Finances
                et du Budget du Burkina Faso.
              </p>
              <p>
                Nous œuvrons pour moderniser et optimiser les processus informatiques afin de garantir
                une gestion efficace et transparente des ressources financières de l'État.
              </p>
            </section>

            <section class="values-section">
              <h2>Nos Valeurs</h2>
              <div class="values-grid">
                <div class="value-card">
                  <div class="value-icon">🎯</div>
                  <h3>Excellence</h3>
                  <p>Nous visons l'excellence dans tous nos projets et prestations.</p>
                </div>
                <div class="value-card">
                  <div class="value-icon">🔒</div>
                  <h3>Sécurité</h3>
                  <p>La sécurité des données et des systèmes est notre priorité absolue.</p>
                </div>
                <div class="value-card">
                  <div class="value-icon">🤝</div>
                  <h3>Collaboration</h3>
                  <p>Nous travaillons en étroite collaboration avec nos partenaires.</p>
                </div>
                <div class="value-card">
                  <div class="value-icon">🚀</div>
                  <h3>Innovation</h3>
                  <p>Nous intégrons les dernières technologies pour des solutions modernes.</p>
                </div>
              </div>
            </section>

            <section class="contact-info">
              <h2>Informations de Contact</h2>
              <div class="contact-grid">
                <div class="contact-item">
                  <div class="contact-icon">📍</div>
                  <div>
                    <h4>Adresse</h4>
                    <p>Boite postale : 01 BP 1122 Ouagadougou 01</p>
                  </div>
                </div>
                <div class="contact-item">
                  <div class="contact-icon">📞</div>
                  <div>
                    <h4>Téléphone</h4>
                    <p>(+226) 20 49 02 73</p>
                  </div>
                </div>
                <div class="contact-item">
                  <div class="contact-icon">📠</div>
                  <div>
                    <h4>Fax</h4>
                    <p>(+226) 20 30 66 64</p>
                  </div>
                </div>
                <div class="contact-item">
                  <div class="contact-icon">🌐</div>
                  <div>
                    <h4>Site web</h4>
                    <p><a href="https://it.finances.bf/" target="_blank">it.finances.bf</a></p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .about-page {
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

    .about-header {
      text-align: center;
      margin-bottom: 4rem;
    }

    .about-header h1 {
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

    .about-content section {
      margin-bottom: 4rem;
    }

    .about-content h2 {
      font-size: 2rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 2rem;
      text-align: center;
    }

    .mission-section p {
      font-size: 1.125rem;
      line-height: 1.7;
      color: #475569;
      max-width: 800px;
      margin: 0 auto 1.5rem auto;
      text-align: center;
    }

    .values-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }

    .value-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      text-align: center;
      transition: transform 0.2s ease;
    }

    .value-card:hover {
      transform: translateY(-4px);
    }

    .value-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .value-card h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 1rem;
    }

    .value-card p {
      color: #64748b;
      line-height: 1.6;
    }

    .contact-info {
      background: white;
      padding: 3rem;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }

    .contact-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }

    .contact-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
      background: #f8fafc;
      border-radius: 8px;
    }

    .contact-icon {
      font-size: 2rem;
      width: 3rem;
      text-align: center;
    }

    .contact-item h4 {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 0.5rem;
    }

    .contact-item p {
      color: #64748b;
      margin: 0;
    }

    .contact-item a {
      color: var(--primary);
      text-decoration: none;
      font-weight: 500;
    }

    .contact-item a:hover {
      text-decoration: underline;
    }

    .nav-menu {
      display: flex;
      gap: 2rem;
    }

    .nav-item {
      position: relative;
      z-index: 1000;
    }

    .nav-link {
      background: none;
      border: none;
      color: #e2e8f0;
      cursor: pointer;
      font-size: 0.875rem;
      padding: 0.5rem 0.75rem;
      border-radius: 4px;
      transition: background 0.2s;
    }

    .nav-link:hover {
      background: rgba(255,255,255,0.1);
    }

    .dropdown-arrow {
      margin-left: 0.25rem;
    }

    .dropdown-menu {
      position: absolute;
      top: calc(100% + 12px);
      left: 50%;
      transform: translateX(-50%) translateY(0);
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      color: #0f172a;
      border-radius: 0;
      box-shadow: 0 20px 40px rgba(2,6,23,0.15), 0 0 0 1px rgba(255, 255, 255, 0.1);
      min-width: 420px;
      width: max-content;
      padding: 1rem 0;
      list-style: none;
      margin: 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 1001;
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      overflow: visible;
      opacity: 0;
      transform: translateY(-6px);
      pointer-events: none;
      transition: opacity 180ms ease, transform 180ms ease;
    }

    .nav-item:hover .dropdown-menu {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }

    .dropdown-item {
      display: block;
      padding: 0.75rem 1.5rem;
      color: #374151 !important;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.2s ease;
      position: relative;
      border-radius: 8px;
      margin: 0 0.5rem;
      white-space: nowrap;
    }

    .dropdown-item:hover {
      color: white !important;
      background: linear-gradient(90deg, var(--primary), #ea580c);
    }

    .dropdown-item::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 0;
      height: 100%;
      background: linear-gradient(90deg, var(--primary), #ea580c);
      border-radius: 8px;
      transition: width 0.3s ease;
      z-index: -1;
    }

    .dropdown-item:hover::before {
      width: 100%;
    }

    .dropdown-item:hover {
      color: white;
      transform: translateX(4px);
    }

    .dropdown-item:first-child {
      margin-top: 0.5rem;
    }

    .dropdown-item:last-child {
      margin-bottom: 0.5rem;
    }

    @media (max-width: 768px) {
      .container {
        padding: 0 1rem;
      }

      .about-header h1 {
        font-size: 2rem;
      }

      .values-grid,
      .contact-grid {
        grid-template-columns: 1fr;
      }

      .contact-item {
        flex-direction: column;
        text-align: center;
      }
    }
  `]
})
export class AboutComponent {
}