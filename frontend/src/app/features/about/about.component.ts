import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="about-page">
      <!-- HEADER OFFICIEL -->
      <header class="official-header">
        <div class="header-content">
          <div class="logo-left">
            <img src="/assets/logoFinal.png" alt="DGSI Logo">
          </div>
          <div class="header-text">
            <div class="ministry-name">Ministère de l'Economie, des Finances et du Développement</div>
            <h1 class="direction-title">DIRECTION GENERALE DES SERVICES INFORMATIQUES</h1>
            <p class="tagline">L'Informatique, pour une gestion efficiente des finances publiques</p>
          </div>
          <div class="logo-right">
            <img src="/assets/armoiriesbf.png" alt="Armoiries Burkina Faso">
          </div>
        </div>
      </header>

      <!-- NAVBAR -->
      <nav class="navbar">
        <div class="container nav-content">
          <div class="nav-links">
            <a routerLink="/about" class="active">À propos</a>
            <a routerLink="/contact">Contact</a>
            <a href="https://www.finances.gov.bf" target="_blank">Ministère</a>
          </div>
          <a routerLink="/" class="btn-primary">Accueil</a>
        </div>
      </nav>

      <main class="main-content">
        <div class="container">

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

            <section class="history-section">
              <h2>Notre Histoire</h2>
              <div class="timeline">
                <div class="timeline-item">
                  <div class="timeline-date">2010</div>
                  <div class="timeline-content">
                    <h3>Création de la DGSI</h3>
                    <p>Fondation de la Direction Générale des Systèmes d'Information au sein du Ministère des Finances.</p>
                  </div>
                </div>
                <div class="timeline-item">
                  <div class="timeline-date">2015</div>
                  <div class="timeline-content">
                    <h3>Modernisation des infrastructures</h3>
                    <p>Lancement d'un vaste programme de renouvellement des équipements informatiques et réseaux.</p>
                  </div>
                </div>
                <div class="timeline-item">
                  <div class="timeline-date">2020</div>
                  <div class="timeline-content">
                    <h3>Transformation digitale</h3>
                    <p>Accélération de la transformation digitale avec l'adoption de nouvelles technologies cloud et mobiles.</p>
                  </div>
                </div>
                <div class="timeline-item">
                  <div class="timeline-date">2024</div>
                  <div class="timeline-content">
                    <h3>MainTrack Pro</h3>
                    <p>Lancement de notre plateforme de suivi professionnel des prestations de maintenance informatique.</p>
                  </div>
                </div>
              </div>
            </section>

            <section class="team-section">
              <h2>Notre Équipe</h2>
              <div class="team-grid">
                <div class="team-member">
                  <div class="member-avatar">👨‍💼</div>
                  <h3>Directeur Général</h3>
                  <p>Expert en systèmes d'information avec plus de 20 ans d'expérience</p>
                </div>
                <div class="team-member">
                  <div class="member-avatar">👩‍💻</div>
                  <h3>Chef de Projet</h3>
                  <p>Spécialiste en développement et gestion de projets technologiques</p>
                </div>
                <div class="team-member">
                  <div class="member-avatar">🛠️</div>
                  <h3>Technicien Senior</h3>
                  <p>Expert en maintenance et support technique informatique</p>
                </div>
                <div class="team-member">
                  <div class="member-avatar">📊</div>
                  <h3>Analyste de Données</h3>
                  <p>Spécialiste en analyse et reporting des performances système</p>
                </div>
              </div>
            </section>

            <section class="stats-section">
              <h2>Chiffres Clés</h2>
              <div class="stats-grid">
                <div class="stat-item">
                  <div class="stat-number">14</div>
                  <div class="stat-label">Années d'expérience</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">500+</div>
                  <div class="stat-label">Équipements maintenus</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">99.9%</div>
                  <div class="stat-label">Taux de disponibilité</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">24/7</div>
                  <div class="stat-label">Support disponible</div>
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

      <!-- FOOTER -->
      <footer class="footer">
        <div class="container">
          <p>&copy; 2024 DGSI - Direction Générale des Systèmes d'Information</p>
          <p>Ministère de l'Économie, des Finances et du Budget du Burkina Faso</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    * { margin: 0; padding: 0; box-sizing: border-box; }

    :host { --primary: #f97316; --dark: #0f172a; --gray: #f1f5f9; --blue: #1e4d7b; }

    .about-page {
      min-height: 100vh;
      background: #f8fafc;
      font-family: 'Inter', -apple-system, sans-serif;
    }

    /* HEADER OFFICIEL */
    .official-header {
      background: linear-gradient(135deg, var(--blue) 0%, #2d5a8a 100%);
      color: white;
      padding: 1.5rem 0;
      border-bottom: 4px solid var(--primary);
      box-shadow: 0 4px 20px rgba(0,0,0,.15);
    }

    .header-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 2rem;
      display: grid;
      grid-template-columns: 180px 1fr 180px;
      align-items: center;
      gap: 2rem;
    }

    .logo-left,
    .logo-right {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logo-left img,
    .logo-right img {
      width: 160px;
      height: 160px;
      object-fit: contain;
      background: white;
      border-radius: 50%;
      padding: 15px;
      box-shadow: 0 6px 20px rgba(0,0,0,.25);
      border: 3px solid rgba(255,255,255,.3);
    }

    .header-text {
      text-align: center;
    }

    .ministry-name {
      font-size: 1.1rem;
      font-weight: 500;
      margin-bottom: .5rem;
      letter-spacing: .5px;
    }

    .direction-title {
      font-size: 2.5rem;
      font-weight: 900;
      letter-spacing: 2px;
      margin: .5rem 0;
      text-shadow: 2px 2px 4px rgba(0,0,0,.3);
    }

    .tagline {
      font-size: 1.3rem;
      font-style: italic;
      color: var(--primary);
      margin-top: .5rem;
      font-weight: 500;
    }

    /* NAVBAR */
    .navbar {
      background: white;
      border-bottom: 1px solid #e2e8f0;
      padding: 1rem 0;
      box-shadow: 0 2px 8px rgba(0,0,0,.05);
    }

    .nav-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .nav-links {
      display: flex;
      gap: 2rem;
    }

    .nav-links a {
      color: #475569;
      text-decoration: none;
      font-weight: 600;
      padding: .5rem 1rem;
      border-radius: 6px;
      transition: all .3s;
    }

    .nav-links a:hover,
    .nav-links a.active {
      color: var(--primary);
      background: #fff7ed;
    }

    .btn-primary {
      background: var(--primary);
      color: white;
      padding: .6rem 1.5rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      transition: all .3s;
    }

    .btn-primary:hover {
      background: #ea580c;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(249,115,22,.3);
    }

    .main-content {
      padding: 4rem 0;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
      position: relative;
      z-index: 1;
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

    .mission-section {
      position: relative;
      padding: 2rem 0;
      display: grid;
      grid-template-columns: 450px 1fr;
      gap: 3rem;
      align-items: center;
    }

    .mission-section::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
      width: 450px;
      height: 450px;
      background: url('/assets/calebasseDGSI.png') center / contain no-repeat;
      opacity: 0.8;
      pointer-events: none;
      z-index: 0;
    }

    .mission-section h2,
    .mission-section p {
      position: relative;
      z-index: 1;
      grid-column: 2;
    }

    .mission-section h2 {
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .mission-section p {
      font-size: 1.125rem;
      line-height: 1.7;
      color: #475569;
      max-width: 100%;
      margin: 0;
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

    .history-section {
      background: white;
      padding: 3rem;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      margin-bottom: 4rem;
    }

    .timeline {
      position: relative;
      padding-left: 2rem;
    }

    .timeline::before {
      content: '';
      position: absolute;
      left: 1rem;
      top: 0;
      bottom: 0;
      width: 2px;
      background: linear-gradient(to bottom, var(--primary), #ea580c);
    }

    .timeline-item {
      position: relative;
      margin-bottom: 2rem;
      padding-left: 2rem;
    }

    .timeline-item::before {
      content: '';
      position: absolute;
      left: -1.5rem;
      top: 0.5rem;
      width: 1rem;
      height: 1rem;
      background: var(--primary);
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.2);
    }

    .timeline-date {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 0.5rem;
    }

    .timeline-content h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 0.5rem;
    }

    .timeline-content p {
      color: #64748b;
      line-height: 1.6;
      margin: 0;
    }

    .team-section {
      background: white;
      padding: 3rem;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      margin-bottom: 4rem;
    }

    .team-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }

    .team-member {
      text-align: center;
      padding: 2rem;
      background: #f8fafc;
      border-radius: 12px;
      transition: transform 0.2s ease;
    }

    .team-member:hover {
      transform: translateY(-4px);
    }

    .member-avatar {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .team-member h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 0.5rem;
    }

    .team-member p {
      color: #64748b;
      line-height: 1.5;
      margin: 0;
    }

    .stats-section {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      color: white;
      padding: 3rem;
      border-radius: 16px;
      margin-bottom: 4rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }

    .stat-item {
      text-align: center;
    }

    .stat-number {
      font-size: 3rem;
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 0.5rem;
    }

    .stat-label {
      font-size: 1rem;
      color: #e2e8f0;
      font-weight: 500;
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

    /* FOOTER */
    .footer {
      background: var(--dark);
      color: #94a3b8;
      padding: 2rem 0;
      text-align: center;
    }

    .footer p {
      margin: .25rem 0;
    }



    /* RESPONSIVE */
    @media (max-width: 1024px) {
      .header-content { grid-template-columns: 120px 1fr 120px; gap: 1rem; }
      .logo-left img, .logo-right img { width: 100px; height: 100px; }
      .direction-title { font-size: 1.8rem; }
      .tagline { font-size: 1rem; }
    }

    @media (max-width: 768px) {
      .header-content { grid-template-columns: 1fr; text-align: center; }
      .logo-left, .logo-right { display: none; }
      .direction-title { font-size: 1.5rem; letter-spacing: 1px; }
      .ministry-name { font-size: .9rem; }
      .container { padding: 0 1rem; }
      .values-grid, .contact-grid { grid-template-columns: 1fr; }
      .contact-item { flex-direction: column; text-align: center; }
      .mission-section { grid-template-columns: 1fr; }
      .mission-section::before { display: none; }
      .mission-section h2, .mission-section p { text-align: center; grid-column: 1; }
    }

    @media (max-width: 640px) {
      .nav-content { flex-direction: column; gap: 1rem; }
      .nav-links { flex-wrap: wrap; justify-content: center; }
      .direction-title { font-size: 1.2rem; }
    }
  `]
})
export class AboutComponent {
}