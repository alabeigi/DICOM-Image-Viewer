export interface ImageMetadata {
  patientID: string;
  patientName: string;
  modality: string;
  seriesInstanceUID: string;
  studyInstanceUID: string;
  studyDate: string;
  files: File[];
  totalSize: number;
}

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
  exiting?: boolean;
}
