import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="contact-page">
      <nav class="navbar">
        <div class="container">
          <div class="nav-brand">
            <div class="logo">
              <img src="/assets/logoFinal.png" alt="DGSI Logo" class="logo-image">
            </div>
          </div>
          <div class="nav-menu">
          </div>
        </div>
      </nav>

      <main class="main-content">
        <div class="container">
          <div class="contact-header">
            <h1>Nous contacter</h1>
            <p class="subtitle">Direction Générale des Systèmes d'Information</p>
          </div>

          <div class="contact-content">
            <div class="contact-grid">
              <div class="contact-card">
                <div class="contact-icon">📧</div>
                <h3>Email</h3>
                <p>Contactez-nous par email pour toute demande d'information</p>
                <a href="mailto:contact&#64;dgsi.bf" class="contact-link">contact&#64;dgsi.bf</a>
              </div>

              <div class="contact-card">
                <div class="contact-icon">📞</div>
                <h3>Téléphone</h3>
                <p>Appelez-nous pour un contact direct</p>
                <a href="tel:+22620490273" class="contact-link">(+226) 20 49 02 73</a>
              </div>

              <div class="contact-card">
                <div class="contact-icon">📠</div>
                <h3>Fax</h3>
                <p>Envoyez-nous vos documents par fax</p>
                <p class="contact-info">(+226) 20 30 66 64</p>
              </div>

              <div class="contact-card">
                <div class="contact-icon">📍</div>
                <h3>Adresse</h3>
                <p>Notre adresse postale</p>
                <p class="contact-info">01 BP 1122 Ouagadougou 01<br>Burkina Faso</p>
              </div>
            </div>

            <div class="additional-info">
              <h2>Informations supplémentaires</h2>
              <div class="info-grid">
                <div class="info-section">
                  <h3>Horaires d'ouverture</h3>
                  <ul>
                    <li>Lundi - Jeudi : 7h30 - 17h30</li>
                    <li>Vendredi : 7h30 - 12h30</li>
                    <li>Samedi - Dimanche : Fermé</li>
                  </ul>
                </div>

                <div class="info-section">
                  <h3>Support technique</h3>
                  <p>Pour les problèmes techniques liés à nos services, veuillez nous contacter par email ou téléphone.</p>
                  <p>Notre équipe technique est à votre disposition pour vous assister.</p>
                </div>

                <div class="info-section">
                  <h3>Service client</h3>
                  <p>Pour toute question relative à nos prestations de maintenance informatique, n'hésitez pas à nous contacter.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .contact-page {
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

    .contact-header {
      text-align: center;
      margin-bottom: 4rem;
    }

    .contact-header h1 {
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

    .contact-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
      margin-bottom: 4rem;
    }

    .contact-card {
      background: white;
      padding: 2.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      text-align: center;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .contact-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    }

    .contact-icon {
      font-size: 3rem;
      margin-bottom: 1.5rem;
    }

    .contact-card h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 1rem;
    }

    .contact-card p {
      color: #64748b;
      margin-bottom: 1.5rem;
      line-height: 1.6;
    }

    .contact-link {
      display: inline-block;
      color: var(--primary);
      font-weight: 600;
      text-decoration: none;
      font-size: 1.125rem;
      transition: color 0.2s ease;
    }

    .contact-link:hover {
      color: #ea580c;
      text-decoration: underline;
    }

    .contact-info {
      color: #475569;
      font-weight: 500;
      font-size: 1.125rem;
      line-height: 1.6;
    }

    .additional-info {
      background: white;
      padding: 3rem;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }

    .additional-info h2 {
      font-size: 2rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 2rem;
      text-align: center;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }

    .info-section h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 1rem;
    }

    .info-section ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .info-section li {
      color: #64748b;
      margin-bottom: 0.5rem;
      padding-left: 1rem;
      position: relative;
    }

    .info-section li::before {
      content: "•";
      color: var(--primary);
      font-weight: bold;
      position: absolute;
      left: 0;
    }

    .info-section p {
      color: #64748b;
      line-height: 1.6;
      margin-bottom: 1rem;
    }

    .nav-menu {
      display: flex;
      gap: 2rem;
    }

    .nav-item {
      position: relative;
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
      top: 100%;
      left: 0;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      min-width: 200px;
      margin-top: 0.5rem;
    }

    .dropdown-item {
      display: block;
      padding: 0.75rem 1rem;
      color: #374151;
      text-decoration: none;
      transition: background 0.2s;
    }

    .dropdown-item:hover {
      background: #f9fafb;
    }

    @media (max-width: 768px) {
      .container {
        padding: 0 1rem;
      }

      .contact-header h1 {
        font-size: 2rem;
      }

      .contact-grid {
        grid-template-columns: 1fr;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ContactComponent {
  hoveredDropdown: string | null = null;
}