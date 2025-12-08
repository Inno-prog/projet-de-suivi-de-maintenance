export const environment = {
  production: false,
  apiUrl: 'http://localhost:8085/api',
  // Enable mock auth for development when Keycloak isn't available
  useMockAuth: true,
  devAuthBypass: true
};

// Configuration de l'environnement de production
export const environmentProd = {
  production: true,
  apiUrl: 'https://your-api-domain.com/api',
  keycloak: {
    issuer: 'https://your-keycloak-domain.com/realms/Maintenance-DGSI',
    clientId: 'maintenance-app',
    requireHttps: true,
    skipIssuerCheck: false,
    strictDiscoveryDocumentValidation: true,
    showDebugInformation: false
  }
};
