import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="contact-page">
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
            <a routerLink="/about">À propos</a>
            <a routerLink="/contact" class="active">Contact</a>
            <a href="https://www.finances.gov.bf" target="_blank">Ministère</a>
          </div>
          <a routerLink="/" class="btn-primary">Accueil</a>
        </div>
      </nav>

      <!-- CONTACT SECTION -->
      <section class="contact-section">
        <div class="container">
          <div class="contact-wrapper">
            <!-- FORMULAIRE -->
            <div class="contact-form-card">
              <h2>Envoyez-nous un message</h2>
              <p class="form-subtitle">Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais</p>
              
              <form class="contact-form" (ngSubmit)="onSubmit()" #contactForm="ngForm">
                <div class="form-group">
                  <label for="name">Nom complet *</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name"
                    [(ngModel)]="formData.name"
                    required
                    placeholder="Votre nom">
                </div>

                <div class="form-group">
                  <label for="email">Email *</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email"
                    [(ngModel)]="formData.email"
                    required
                    placeholder="votre.email&#64;exemple.com">
                </div>

                <div class="form-group">
                  <label for="phone">Téléphone</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    name="phone"
                    [(ngModel)]="formData.phone"
                    placeholder="+226 XX XX XX XX">
                </div>

                <div class="form-group">
                  <label for="subject">Sujet *</label>
                  <select 
                    id="subject" 
                    name="subject"
                    [(ngModel)]="formData.subject"
                    required>
                    <option value="">Sélectionnez un sujet</option>
                    <option value="support">Support technique</option>
                    <option value="maintenance">Demande de maintenance</option>
                    <option value="formation">Formation</option>
                    <option value="info">Demande d'information</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="message">Message *</label>
                  <textarea 
                    id="message" 
                    name="message"
                    [(ngModel)]="formData.message"
                    required
                    rows="5"
                    placeholder="Décrivez votre demande..."></textarea>
                </div>

                <button 
                  type="submit" 
                  class="btn-submit"
                  [disabled]="!contactForm.valid || isSubmitting">
                  {{ isSubmitting ? 'Envoi en cours...' : 'Envoyer le message' }}
                </button>

                <div *ngIf="submitSuccess" class="alert alert-success">
                  ✓ Votre message a été envoyé avec succès !
                </div>
              </form>
            </div>

            <!-- INFO CARDS -->
            <div class="contact-info-cards">
              <div class="info-card">
                <div class="icon-wrapper phone">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3>Téléphone</h3>
                <p>(+226) 20 49 02 73</p>
                <span class="info-label">Lun - Jeu: 7h30 - 17h30</span>
              </div>

              <div class="info-card">
                <div class="icon-wrapper email">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3>Email</h3>
                <p>contact&#64;dgsi.bf</p>
                <span class="info-label">Réponse sous 24h</span>
              </div>

              <div class="info-card">
                <div class="icon-wrapper location">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3>Adresse</h3>
                <p>01 BP 1122<br>Ouagadougou 01</p>
                <span class="info-label">Burkina Faso</span>
              </div>

              <div class="info-card">
                <div class="icon-wrapper web">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <h3>Site web</h3>
                <a href="https://it.finances.bf/" target="_blank">it.finances.bf</a>
                <span class="info-label">Portail officiel</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- FAQ -->
      <section class="faq-section">
        <div class="container">
          <div class="section-header">
            <h2>Questions fréquentes</h2>
            <p>Trouvez rapidement des réponses à vos questions</p>
          </div>

          <div class="faq-grid">
            <div class="faq-item">
              <div class="faq-icon">❓</div>
              <h3>Comment signaler un problème technique ?</h3>
              <p>Contactez notre support au (+226) 20 49 02 73 ou utilisez le formulaire ci-dessus en sélectionnant "Support technique".</p>
            </div>

            <div class="faq-item">
              <div class="faq-icon">⏱️</div>
              <h3>Quels sont vos délais d'intervention ?</h3>
              <p>Nous intervenons sous 24h pour les urgences et sous 48h pour les interventions programmées.</p>
            </div>

            <div class="faq-item">
              <div class="faq-icon">🎓</div>
              <h3>Proposez-vous des formations ?</h3>
              <p>Oui, nous proposons des formations sur l'utilisation et la maintenance des équipements informatiques.</p>
            </div>

            <div class="faq-item">
              <div class="faq-icon">🔐</div>
              <h3>Comment accéder à MainTrack Pro ?</h3>
              <p>Contactez-nous pour obtenir vos identifiants d'accès à la plateforme MainTrack Pro.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- FOOTER -->
      <footer class="footer">
        <div class="footer-container">
          <div class="footer-image">
            <img src="/assets/calebasseDGSI.png" alt="Calebasse DGSI">
          </div>
          <div class="footer-text">
            <p>&copy; 2024 DGSI - Direction Générale des Systèmes d'Information</p>
            <p>Ministère de l'Économie, des Finances et du Budget du Burkina Faso</p>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    * { margin: 0; padding: 0; box-sizing: border-box; }

    :host { --primary: #f97316; --dark: #0f172a; --gray: #f1f5f9; --blue: #1e4d7b; }

    .contact-page {
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

    /* CONTACT SECTION */
    .contact-section {
      padding: 5rem 0;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      position: relative;
      overflow: hidden;
    }

    .contact-section::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 800px;
      height: 800px;
      background: url('/assets/calebasseDGSI.png') center / contain no-repeat;
      opacity: 0.15;
      pointer-events: none;
      z-index: 0;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
      position: relative;
      z-index: 1;
    }

    .contact-wrapper {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 3rem;
      align-items: start;
    }

    /* FORMULAIRE */
    .contact-form-card {
      background: rgba(255,255,255,.95);
      backdrop-filter: blur(10px);
      padding: 3rem;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,.1);
    }

    .contact-form-card h2 {
      font-size: 2rem;
      color: var(--dark);
      margin-bottom: .5rem;
    }

    .form-subtitle {
      color: #64748b;
      margin-bottom: 2rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      font-weight: 600;
      color: var(--dark);
      margin-bottom: .5rem;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: .875rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 1rem;
      transition: all .3s;
      font-family: inherit;
      background: white;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(249,115,22,.1);
    }

    .form-group textarea {
      resize: vertical;
      min-height: 120px;
    }

    .btn-submit {
      width: 100%;
      background: var(--primary);
      color: white;
      padding: 1rem;
      border: none;
      border-radius: 8px;
      font-size: 1.125rem;
      font-weight: 600;
      cursor: pointer;
      transition: all .3s;
    }

    .btn-submit:hover:not(:disabled) {
      background: #ea580c;
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(249,115,22,.3);
    }

    .btn-submit:disabled {
      opacity: .6;
      cursor: not-allowed;
    }

    .alert {
      margin-top: 1rem;
      padding: 1rem;
      border-radius: 8px;
      font-weight: 500;
    }

    .alert-success {
      background: #dcfce7;
      color: #166534;
      border: 1px solid #86efac;
    }

    /* INFO CARDS */
    .contact-info-cards {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .info-card {
      background: rgba(255,255,255,.95);
      backdrop-filter: blur(10px);
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,.08);
      transition: all .3s;
    }

    .info-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 30px rgba(0,0,0,.15);
    }

    .icon-wrapper {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
    }

    .icon-wrapper svg {
      width: 28px;
      height: 28px;
      color: white;
    }

    .icon-wrapper.phone { background: linear-gradient(135deg, #3b82f6, #2563eb); }
    .icon-wrapper.email { background: linear-gradient(135deg, #f97316, #ea580c); }
    .icon-wrapper.location { background: linear-gradient(135deg, #10b981, #059669); }
    .icon-wrapper.web { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }

    .info-card h3 {
      font-size: 1.125rem;
      color: var(--dark);
      margin-bottom: .5rem;
    }

    .info-card p {
      color: #475569;
      font-size: 1rem;
      line-height: 1.6;
      margin-bottom: .5rem;
    }

    .info-card a {
      color: var(--primary);
      text-decoration: none;
      font-weight: 600;
    }

    .info-card a:hover {
      text-decoration: underline;
    }

    .info-label {
      display: inline-block;
      background: var(--gray);
      color: #64748b;
      padding: .25rem .75rem;
      border-radius: 6px;
      font-size: .875rem;
      margin-top: .5rem;
    }

    /* FAQ */
    .faq-section {
      padding: 5rem 0;
      background: white;
    }

    .section-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .section-header h2 {
      font-size: 2.5rem;
      color: var(--dark);
      margin-bottom: .5rem;
    }

    .section-header p {
      color: #64748b;
      font-size: 1.125rem;
    }

    .faq-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
    }

    .faq-item {
      background: var(--gray);
      padding: 2rem;
      border-radius: 12px;
      border-left: 4px solid var(--primary);
      transition: all .3s;
    }

    .faq-item:hover {
      transform: translateX(4px);
      box-shadow: 0 4px 20px rgba(0,0,0,.08);
    }

    .faq-icon {
      font-size: 2rem;
      margin-bottom: 1rem;
    }

    .faq-item h3 {
      font-size: 1.125rem;
      color: var(--dark);
      margin-bottom: 1rem;
    }

    .faq-item p {
      color: #475569;
      line-height: 1.6;
    }

    /* FOOTER */
    .footer {
      background: var(--dark);
      color: #94a3b8;
      padding: 2rem 0;
    }

    .footer-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
      display: grid;
      grid-template-columns: 200px 1fr;
      gap: 2rem;
      align-items: center;
    }

    .footer-image img {
      width: 100%;
      max-width: 180px;
      height: auto;
      object-fit: contain;
    }

    .footer-text {
      text-align: left;
    }

    .footer-text p {
      margin: .25rem 0;
    }

    /* RESPONSIVE */
    @media (max-width: 1024px) {
      .header-content { grid-template-columns: 120px 1fr 120px; gap: 1rem; }
      .logo-left img, .logo-right img { width: 100px; height: 100px; }
      .direction-title { font-size: 1.8rem; }
      .tagline { font-size: 1rem; }
      .contact-section::before { opacity: 0.08; }
    }

    @media (max-width: 968px) {
      .contact-wrapper { grid-template-columns: 1fr; }
      .contact-form-card { padding: 2rem; }
    }

    @media (max-width: 768px) {
      .header-content { grid-template-columns: 1fr; text-align: center; }
      .logo-left, .logo-right { display: none; }
      .direction-title { font-size: 1.5rem; letter-spacing: 1px; }
      .ministry-name { font-size: .9rem; }
      .container { padding: 0 1rem; }
      .contact-section::before { display: none; }
      .footer-container { grid-template-columns: 1fr; text-align: center; }
      .footer-text { text-align: center; }
      .footer-image { display: flex; justify-content: center; }
    }

    @media (max-width: 640px) {
      .nav-content { flex-direction: column; gap: 1rem; }
      .nav-links { flex-wrap: wrap; justify-content: center; }
      .direction-title { font-size: 1.2rem; }
      .faq-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class ContactComponent {
  formData = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  };

  isSubmitting = false;
  submitSuccess = false;

  onSubmit() {
    this.isSubmitting = true;
    
    setTimeout(() => {
      this.isSubmitting = false;
      this.submitSuccess = true;
      
      this.formData = {
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      };

      setTimeout(() => {
        this.submitSuccess = false;
      }, 5000);
    }, 1500);
  }
}
