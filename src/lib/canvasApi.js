import { supabase } from './supabase';

/**
 * Creates a new canvas.
 * @param {Object} [options] - Optional parameters for the new canvas.
 * @returns {Promise<string>} The ID of the newly created canvas.
 */
export async function createCanvas(options = {}) {
  const { data, error } = await supabase
    .from('canvases')
    .insert([options])
    .select('id')
    .single();

  if (error) {
    console.error('Error creating canvas:', error);
    throw error;
  }

  return data.id;
}

/**
 * Fetches a canvas by its ID.
 * @param {string} id - The ID of the canvas.
 * @returns {Promise<Object>} The canvas data.
 */
export async function getCanvas(id) {
  const { data, error } = await supabase
    .from('canvases')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching canvas ${id}:`, error);
    throw error;
  }

  return data;
}

/**
 * Updates a canvas.
 * @param {string} id - The ID of the canvas to update.
 * @param {Object} updates - The data to update (e.g., canvas_data).
 * @returns {Promise<Object>} The updated canvas data.
 */
export async function updateCanvas(id, updates) {
  const { data, error } = await supabase
    .from('canvases')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating canvas ${id}:`, error);
    throw error;
  }

  return data;
}

/**
 * Deletes a canvas by its ID.
 * @param {string} id - The ID of the canvas to delete.
 */
export async function deleteCanvas(id) {
  const { error } = await supabase
    .from('canvases')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting canvas ${id}:`, error);
    throw error;
  }
}

/**
 * Fetches all canvases owned by a specific user.
 * @param {string} ownerId - The ID of the user.
 * @returns {Promise<Array>} A list of canvases.
 */
export async function listCanvasesByOwner(ownerId) {
  const { data, error } = await supabase
    .from('canvases')
    .select('*')
    .eq('owner_id', ownerId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error(`Error fetching canvases for owner ${ownerId}:`, error);
    throw error;
  }

  return data;
}

/**
 * Fetches a canvas from Supabase, checking for expiration.
 * @param {string} canvasId - The ID of the canvas.
 * @returns {Promise<Object|null>} The canvas data or null if not found/expired.
 */
export async function fetchCanvasFromSupabase(canvasId) {
  const { data, error } = await supabase
    .from('canvases')
    .select('canvas_data, expires_at')
    .eq('id', canvasId)
    .single();

  if (error || !data) return null;

  // Check expiry
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return null; // expired
  }

  return data.canvas_data;
}

/**
 * Saves canvas data to Supabase.
 * @param {string} canvasId - The ID of the canvas.
 * @param {Object} canvasData - The data to save.
 */
export async function saveCanvasToSupabase(canvasId, canvasData) {
  const { error } = await supabase
    .from('canvases')
    .upsert({
      id: canvasId,
      canvas_data: canvasData,
      is_anonymous: true,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('❌ Save to Supabase failed:', error);
  } else {
    console.log(`✅ Successfully synced canvas to Supabase!`);
  }
}
