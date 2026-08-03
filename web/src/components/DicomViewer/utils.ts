/* ===== DICOM Metadata Helpers ===== */

export const getModalityClass = (modality: string): string => {
  const m = modality.toUpperCase();
  if (m === 'CT') return 'modality-ct';
  if (m === 'MR') return 'modality-mr';
  if (m === 'CR' || m === 'DX' || m === 'XA') return 'modality-xray';
  return 'modality-default';
};

export const truncateUID = (uid: string): string => {
  if (uid.length <= 18) return uid;
  return uid.substring(0, 18) + '…';
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const formatDate = (dicomDate: string): string => {
  if (!dicomDate || dicomDate.length < 8) return dicomDate || 'Unknown';
  const year = dicomDate.substring(0, 4);
  const month = dicomDate.substring(4, 6);
  const day = dicomDate.substring(6, 8);
  return `${year}-${month}-${day}`;
};

export const formatPatientName = (name: string): string => {
  if (!name) return 'Unknown';
  return name.replace(/\^/g, ' ').trim();
};
