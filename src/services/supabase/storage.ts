import { supabase } from '@/config/supabase';

// Storage bucket names
export const STORAGE_BUCKETS = {
  PROFILE_PICTURES: 'profile-pictures',
  EXAM_RESOURCES: 'exam-resources',
  SUBMISSION_ATTACHMENTS: 'submission-attachments'
} as const;

// File validation
export const validateFile = (file: File, maxSize = 5 * 1024 * 1024, allowedTypes: string[] = []) => {
  if (file.size > maxSize) {
    throw new Error(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    throw new Error(`File type ${file.type} is not allowed`);
  }

  return true;
};

export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

// Upload profile picture
export const uploadProfilePicture = async (userId: string, file: File): Promise<string> => {
  validateFile(file, 5 * 1024 * 1024, IMAGE_TYPES);

  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/avatar.${fileExt}`;

  const { data, error } = await supabase.storage.
  from(STORAGE_BUCKETS.PROFILE_PICTURES).
  upload(fileName, file, { upsert: true });

  if (error) throw error;

  const { data: urlData } = supabase.storage.
  from(STORAGE_BUCKETS.PROFILE_PICTURES).
  getPublicUrl(fileName);

  return urlData.publicUrl;
};

// Upload exam attachment
export const uploadExamAttachment = async (examId: string, file: File): Promise<string> => {
  validateFile(file, 10 * 1024 * 1024, [...DOCUMENT_TYPES, ...IMAGE_TYPES]);

  const fileExt = file.name.split('.').pop();
  const fileName = `${examId}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage.
  from(STORAGE_BUCKETS.EXAM_RESOURCES).
  upload(fileName, file);

  if (error) throw error;

  const { data: urlData } = supabase.storage.
  from(STORAGE_BUCKETS.EXAM_RESOURCES).
  getPublicUrl(fileName);

  return urlData.publicUrl;
};

// Upload submission attachment
export const uploadSubmissionAttachment = async (submissionId: string, file: File): Promise<string> => {
  validateFile(file, 10 * 1024 * 1024, [...DOCUMENT_TYPES, ...IMAGE_TYPES]);

  const fileExt = file.name.split('.').pop();
  const fileName = `${submissionId}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage.
  from(STORAGE_BUCKETS.SUBMISSION_ATTACHMENTS).
  upload(fileName, file);

  if (error) throw error;

  const { data: urlData } = supabase.storage.
  from(STORAGE_BUCKETS.SUBMISSION_ATTACHMENTS).
  getPublicUrl(fileName);

  return urlData.publicUrl;
};

// Delete file
export const deleteFile = async (bucket: string, path: string): Promise<void> => {
  const { error } = await supabase.storage.
  from(bucket).
  remove([path]);

  if (error) throw error;
};

// Get download URL
export const getFileDownloadURL = async (bucket: string, path: string): Promise<string> => {
  const { data } = supabase.storage.
  from(bucket).
  getPublicUrl(path);

  return data.publicUrl;
};

// List files in a bucket folder
export const listFiles = async (bucket: string, folder: string = '') => {
  const { data, error } = await supabase.storage.
  from(bucket).
  list(folder);

  if (error) throw error;
  return data || [];
};