// ─── KYC Shared Types ─────────────────────────────────────────────────────────
// Used by: kyc-service, apps/web, apps/mobile

export type KYCStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

export type KYCDocumentType =
  | 'GOVERNMENT_ID'
  | 'PASSPORT'
  | 'DRIVERS_LICENSE'
  | 'PROOF_OF_ADDRESS'
  | 'SELFIE_PHOTOGRAPH';

export interface KYCDocument {
  id: string;
  submissionId: string;
  type: KYCDocumentType;
  fileName: string;
  mimeType: string;
  /** Base64-encoded or presigned URL — resolved at read time */
  url?: string;
  uploadedAt: string; // ISO-8601
}

export interface KYCSubmission {
  id: string;
  engineerId: string;
  tenantId: string;
  status: KYCStatus;
  documents: KYCDocument[];
  reviewedBy?: string;       // Admin user id
  rejectionReason?: string;
  submittedAt: string;       // ISO-8601
  reviewedAt?: string;       // ISO-8601
}

// ─── Request / Response Payloads ──────────────────────────────────────────────

export interface SubmitKYCRequest {
  engineerId: string;
  tenantId: string;
  documents: Array<{
    type: KYCDocumentType;
    fileName: string;
    mimeType: string;
    base64Data: string;
  }>;
}

export interface ReviewKYCRequest {
  adminId: string;
  decision: 'APPROVE' | 'REJECT';
  rejectionReason?: string;
}

export interface KYCStatusResponse {
  engineerId: string;
  status: KYCStatus;
  submissionId?: string;
  rejectionReason?: string;
  reviewedAt?: string;
}

export interface KYCListResponse {
  total: number;
  page: number;
  pageSize: number;
  submissions: KYCSubmission[];
}
