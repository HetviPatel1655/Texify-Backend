export interface Identifiable {
  id: string;
}

export interface SoftDeletable {
  deletedAt: Date | null;
}

export interface AuditedEntity {
  createdAt: Date;
  updatedAt: Date;
}
