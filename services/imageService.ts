
import { supabase } from '../lib/supabaseClient';

export const ImageService = {
  /**
   * Uploads an image to Supabase Storage and returns the public URL.
   * If you have Cloudflare configured, you can replace the domain in the returned URL.
   */
  uploadImage: async (file: File, bucket: string = 'ad-images'): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (error) {
        console.error('Error uploading image:', error.message);
        return null;
      }

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      console.error('Upload failed:', err);
      return null;
    }
  },

  /**
   * Deletes an image from storage
   */
  deleteImage: async (url: string, bucket: string = 'ad-images') => {
      try {
        // Extract path from URL
        const urlParts = url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        
        await supabase.storage.from(bucket).remove([fileName]);
      } catch (err) {
          console.error('Delete failed:', err);
      }
  }
};
