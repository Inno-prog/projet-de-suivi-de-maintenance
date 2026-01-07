export const environment = {
  production: false,
  apiUrl: 'http://localhost:8085/api',
  // useMockAuth: false, // Disabled to use real Keycloak authentication
  devAuthBypass: false // Disabled to use real authentication
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
