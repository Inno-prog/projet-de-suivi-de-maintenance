export interface StructureHierarchy {
  id?: string;
  nom: string;
  contact?: string;
  email?: string;
  ville?: string;
  adresseStructure?: string;
  description?: string;
  categorie?: string;
  // Lot relationship
  lot?: {
    id: number;
    nomLot: string;
    codeLot?: string;
  };
  // Correspondant Informatique (CI) fields
  nomCI?: string;
  prenomCI?: string;
  contactCI?: string;
  fonctionCI?: string;
  createdAt?: string;
  updatedAt?: string;
  // Hierarchy specific fields
  parentId?: string;
  children?: StructureHierarchy[];
  level?: number;
  path?: string[];
}
