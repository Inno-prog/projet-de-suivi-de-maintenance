export interface Contrat {
   id?: number;
   idContrat: string;
   typeContrat: string;
   dateDebut: string;
   dateFin: string;
   nomPrestataire: string;
   montant: number;
   lot: string;
   ville: string;
   statut: StatutContrat;
   fichierContrat?: string;
   prestataireId?: number;
   items?: Item[];
   itemIds?: number[]; // Pour la création/modification
}

export enum StatutContrat {
  ACTIF = 'ACTIF',
  SUSPENDU = 'SUSPENDU',
  TERMINE = 'TERMINE',
  EXPIRE = 'EXPIRE'
}

export interface PrestationOC {
  numero: string;
  designation: string;
  min: number;
  max: number;
  pu: number;

  oc1: number;
  oc2: number;
  oc3: number;
  oc4: number;

  montantOc1: number;
  montantOc2: number;
  montantOc3: number;
  montantOc4: number;

  ecart: number;
}

export interface OrdreDeCommande {
  id: number;
  annee: number;
  trimestre: number;
  dateCreation: Date;

  prestations: PrestationOC[];

  totalGeneral: number;
  totalEcart: number;
}

export interface OrdreCommande {
  // Required attributes (as requested)
  idOC: string;
  numeroOc?: string;
  max_prestations?: number;
  min_prestations?: number;
  prixUnitPrest?: number;
  montantOC?: number;
  statut: StatutCommande;
  observations?: string;

  // Relations
  prestations?: Prestation[];
  item?: Item;
  items?: Item[];

  // Optional helpers and legacy fields (kept for compatibility)
  id?: number;
  numeroCommande?: string;
  nomItem?: string;
  minArticles?: number;
  maxArticles?: number;
  nombreArticlesUtilise?: number;
  ecartArticles?: number;
  trimestre?: number;
  annee?: number;
  prestataireItem?: string;
  montant?: number;
  description?: string;
  dateCreation?: string;
  contratId?: number;
  penalites?: number;

  // Nouvelles propriétés calculées (du backend)
  montantTotalCalcule?: number;
  penalitesCalculees?: number;
  prixUnitairesItemsJson?: string;
  ecartCalcule?: number;
  totalGeneral?: number;
  totalEcart?: number;
}

export function calculer_ecart_item(ordre: OrdreCommande): number {
  if (!ordre.items || ordre.items.length === 0) {
    return 0;
  }

  const totalMax = ordre.items.reduce((sum, item) => sum + (item.quantiteMaxTrimestre || 0), 0);
  const totalMin = ordre.items.reduce((sum, item) => sum + (item.quantiteMinTrimestre || 0), 0);
  const totalUsed = ordre.items.reduce((sum, item) => sum + (item.quantiteUtilisee || 0), 0);

  // Calculate the difference between max capacity and actual usage
  return Math.max(0, totalMax - totalUsed);
}

export function calcul_montantTotal(ordre: OrdreCommande): number {
  if (ordre.prestations && ordre.prestations.length > 0) {
    return ordre.prestations.reduce((sum, p) => sum + (p.montantPrest || 0), 0);
  }
  return ordre.montant || 0;
}

export function calcul_penalite(ordre: OrdreCommande): number {
  if (ordre.prestations && ordre.prestations.length > 0) {
    const realizedAmount = ordre.prestations.reduce((sum, p) => sum + (p.montantPrest || 0), 0);
    const maxAmount = ordre.items && ordre.items.length > 0 ?
      ordre.items.reduce((sum, item) => sum + ((item.quantiteMaxTrimestre || 0) * (item.prix || 0)), 0) : 0;
    return Math.max(0, maxAmount - realizedAmount);
  }
  const ecart = calculer_ecart_item(ordre);
  const prix = ordre.prixUnitPrest ?? ordre.montant ?? 0;
  // Default penalty rule: 10% of unit price per missing prestation
  const penalite = Math.max(0, ecart) * prix * 0.1;
  return Math.round(penalite);
}

export enum StatutCommande {
  EN_ATTENTE = 'EN_ATTENTE',
  APPROUVE = 'APPROUVE',
  NON_APPROUVE = 'NON_APPROUVE',
  REJETE = 'REJETE',
  EN_COURS = 'EN_COURS',
  TERMINE = 'TERMINE'
}

export interface EvaluationTrimestrielle {
  id?: number;
  sessionId?: number;
  trimestre: string;
  lot: string;
  prestataireNom: string;
  dateEvaluation: string;
  evaluateurNom: string;
  correspondantId: number;
  techniciensListe?: string;
  techniciensCertifies?: boolean;
  rapportInterventionTransmis?: boolean;
  registreRempli?: boolean;
  horairesRespectes?: boolean;
  delaiReactionRespecte?: boolean;
  delaiInterventionRespecte?: boolean;
  vehiculeDisponible?: boolean;
  tenueDisponible?: boolean;
  obsTechniciens?: string;
  obsRapport?: string;
  obsRegistre?: string;
  obsHoraires?: string;
  obsDelaiReaction?: string;
  obsDelaiIntervention?: string;
  obsVehicule?: string;
  obsTenue?: string;
  prestationsVerifiees?: string;
  instancesNonResolues?: string;
  observationsGenerales?: string;
  appreciationRepresentant?: string;
  signatureRepresentant?: string;
  signatureEvaluateur?: string;
  preuves?: string;
  statut: string;
  penalitesCalcul?: number;
  noteFinale?: number;
  prestataireDeclasse?: boolean;
  dateCreation?: string;
  dateModification?: string;
  utilisateurCreation?: number;
  utilisateurModification?: number;
  fichierPdf?: string;
}

export enum Trimestre {
  T1 = 'T1',
  T2 = 'T2',
  T3 = 'T3',
  T4 = 'T4'
}


export interface PrestationItem {
  id?: number;
  numero: string;
  prestation: string;
  minArticles: number;
  maxArticles: number;
  prixUnitaire: number;
}

export interface FichePrestation {
  id?: number;
  idPrestation: string;
  nomPrestataire: string;
  nomItem: string;
  itemsCouverts?: string;
  dateRealisation: string;
  statut: StatutFiche;
  quantite: number;
  commentaire?: string;
  fichiersContrat?: string;
  statutIntervention?: string;
  ordreCommande?: {
    id: number;
    numeroCommande: string;
    statut: StatutCommande;
  };
}

export enum StatutFiche {
  EN_ATTENTE = 'EN_ATTENTE',
  EN_COURS = 'EN_COURS',
  TERMINEE = 'TERMINEE',
  VALIDE = 'VALIDE',
  REJETE = 'REJETE'
}

export enum StatutValidation {
  BROUILLON = 'BROUILLON',
  EN_ATTENTE = 'EN_ATTENTE',
  VALIDE = 'VALIDE',
  REJETE = 'REJETE'
}

export interface LotWithContractorDto {
  lot: string;
  villes: string[];
  contractIds: string[];
  fichesCount: number;
}

export interface Lot {
    id: number;
    nomLot: string;
    codeLot: string;
}

export interface Item {
    id?: number;
    idItem?: number;
    nomItem: string;
    description?: string;
    prix: number;
    quantiteMinTrimestre?: number;
    quantiteMaxTrimestre: number;
    lot?: string;
    quantiteUtilisee?: number;
    equipements?: Equipement[];
   }

export interface Equipement {
  id?: number;
  nomEquipement: string;
  description?: string;
  typeEquipement: string;
  statut: string;
  prestations?: Prestation[];
}

export interface TypeItem {
  id?: number;
  numero: string;
  prestation: string;
  minArticles: number;
  maxArticles: number;
  prixUnitaire: number;
  oc1Quantity?: number;
}

export interface Prestation {
  id?: number;
  nomPrestataire: string;
  nomPrestation: string;
  montantPrest: number;
  equipementsUtilises: Equipement[];
  equipementsUtilisesString?: string;
  itemsUtilises?: Item[]; // Items couverts par cette prestation
  quantiteItem?: number; // Kept for backward compatibility
  nbPrestRealise: number;
  trimestre: string;
  dateDebut: string;
  dateFin: string;
  statut: string;
  statutValidation?: StatutValidation; // BROUILLON, EN_ATTENTE, VALIDER, REJETER
  description?: string;
  ordreCommande?: OrdreCommande;
  // Enhanced fields
  prestataireId?: string;
  contactPrestataire?: string;
  structurePrestataire?: string;
  servicePrestataire?: string;
  rolePrestataire?: string;
  qualificationPrestataire?: string;
  montantIntervention?: number;
  dateHeureDebut?: string;
  dateHeureFin?: string;
  observationsPrestataire?: string;
  statutIntervention?: string;
  nomStructure?: string;
  contactStructure?: string;
  adresseStructure?: string;
  fonctionStructure?: string;
  observationsClient?: string;
  prenomStructure?: string;
  serviceStructure?: string;
}

export interface RapportSuivi {
  id?: number;
  ordreCommandeId?: number;
  ordreCommande?: OrdreCommande;
  dateRapport: string;
  trimestre: string;
  prestataire: string;
  prestationsRealisees: number;
  observations?: string;
  statut: StatutRapport;
  dateCreation?: string;
  dateModification?: string;
}

export enum StatutRapport {
  EN_ATTENTE = 'EN_ATTENTE',
  APPROUVE = 'APPROUVE',
  REJETE = 'REJETE'
}

export interface StructureMefp {
  id?: string;
  nom: string;
  contact?: string;
  email?: string;
  ville?: string;
  adresseStructure?: string;
  description?: string;
  categorie?: string;
  // Correspondant Informatique (CI) fields
  nomCI?: string;
  prenomCI?: string;
  contactCI?: string;
  fonctionCI?: string;
  createdAt?: string;
  updatedAt?: string;
}
