const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('[Supabase Config] Missing SUPABASE_URL or keys in environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

/**
 * Upload a file buffer directly to Supabase Storage
 * @param {Buffer} fileBuffer 
 * @param {string} filename 
 * @param {string} mimeType 
 * @returns {Promise<string>} Public URL of uploaded image
 */
async function uploadToStorage(fileBuffer, filename, mimeType = 'image/jpeg') {
  const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'complaint-photos';
  const filePath = `complaints/${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, fileBuffer, {
      contentType: mimeType,
      upsert: true
    });

  if (error) {
    console.error('[Supabase Storage Upload Error]', error);
    throw error;
  }

  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

module.exports = {
  supabase,
  uploadToStorage
};
