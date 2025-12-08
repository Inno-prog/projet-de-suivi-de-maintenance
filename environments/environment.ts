export const environment = {
  production: false,
  apiUrl: 'http://localhost:8085/api',
  // Disable mock auth to use real Keycloak authentication
  useMockAuth: false,
  devAuthBypass: false
};

// Configuration de l'environnement de production
export const environmentProd = {
  production: true,
  apiUrl: 'https://your-api-domain.com/api',  // Remplacer par votre domaine API de production
  keycloak: {
    issuer: 'https://your-keycloak-domain.com/realms/Maintenance-DGSI',
    clientId: 'maintenance-app',
    requireHttps: true,
    skipIssuerCheck: false,
    strictDiscoveryDocumentValidation: true,
    showDebugInformation: false
  }
};
