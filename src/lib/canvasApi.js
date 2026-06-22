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
    .select('*, canvas_tags(tags(*))')
    .eq('owner_id', ownerId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error(`Error fetching canvases for owner ${ownerId}:`, error);
    throw error;
  }

  // Flatten the nested tags structure for easier use in components
  return data.map(canvas => {
    const tags = canvas.canvas_tags 
      ? canvas.canvas_tags.map(ct => ct.tags).filter(Boolean)
      : [];
    
    // Remove the original canvas_tags array to keep object clean
    const { canvas_tags, ...rest } = canvas;
    return { ...rest, tags };
  });
}

/**
 * Fetches a canvas from Supabase, checking for expiration.
 * @param {string} canvasId - The ID of the canvas.
 * @returns {Promise<Object|null>} The canvas data or null if not found/expired.
 */
export async function fetchCanvasFromSupabase(canvasId) {
  const { data, error } = await supabase
    .from('canvases')
    .select('canvas_data, expires_at, is_anonymous')
    .eq('id', canvasId)
    .single();

  if (error || !data) return null;

  // Check expiry for anonymous canvases
  if (data.is_anonymous && data.expires_at && new Date(data.expires_at) < new Date()) {
    return { expired: true }; // explicitly return expired status
  }

  return data.canvas_data;
}

/**
 * Uploads a thumbnail to Supabase Storage.
 * @param {string} canvasId - The ID of the canvas.
 * @param {Blob} blob - The image blob.
 * @returns {Promise<string|null>} The public URL of the uploaded image.
 */
export async function uploadThumbnail(canvasId, svgString) {
  try {
    const fileName = `${canvasId}.svg`;
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    
    const { error } = await supabase.storage
      .from('thumbnails')
      .upload(fileName, blob, { upsert: true, contentType: 'image/svg+xml' });

    if (error) {
      console.error("Failed to upload thumbnail to Supabase", error);
      return null;
    }

    const { data } = supabase.storage.from('thumbnails').getPublicUrl(fileName);
    return data?.publicUrl || null;
  } catch (err) {
    console.error("Error in uploadThumbnail", err);
    return null;
  }
}

/**
 * Saves canvas data to Supabase.
 * @param {string} canvasId - The ID of the canvas.
 * @param {Object} canvasData - The data to save.
 * @param {string} [ownerId] - Optional user ID if logged in.
 * @param {string} [thumbnailUrl] - Optional URL of the canvas thumbnail.
 */
export async function saveCanvasToSupabase(canvasId, canvasData, ownerId = null, thumbnailUrl = null) {
  const payload = {
    id: canvasId,
    canvas_data: canvasData,
    is_anonymous: !ownerId,
    owner_id: ownerId,
    updated_at: new Date().toISOString(),
  };

  if (thumbnailUrl) {
    payload.thumbnail_url = thumbnailUrl;
  }

  const { error } = await supabase
    .from('canvases')
    .upsert(payload);

  if (error) {
    console.error('❌ Save to Supabase failed:', error);
  } else {
    console.log(`✅ Successfully synced canvas to Supabase!`);
  }
}

/**
 * Duplicates a canvas.
 * @param {string} sourceId - The ID of the canvas to duplicate.
 * @param {string} newId - The newly generated ID for the clone.
 * @param {string} ownerId - The owner's ID.
 */
export async function duplicateCanvas(sourceId, newId, ownerId) {
  // 1. Fetch original canvas
  const original = await getCanvas(sourceId);
  if (!original) throw new Error("Original canvas not found");

  // 2. Insert duplicate
  const newName = original.name ? `${original.name} (copy)` : 'Untitled Canvas (copy)';
  
  const payload = {
    id: newId,
    name: newName,
    canvas_data: original.canvas_data,
    is_anonymous: false,
    owner_id: ownerId,
    updated_at: new Date().toISOString()
  };

  if (original.thumbnail_url) {
    payload.thumbnail_url = original.thumbnail_url;
  }
  
  const { data, error } = await supabase
    .from('canvases')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error(`Error duplicating canvas ${sourceId}:`, error);
    throw error;
  }
  
  return data;
}

// ==========================================
// Folder API
// ==========================================

export async function listFolders(ownerId) {
  const { data, error } = await supabase
    .from('folders')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error(`Error fetching folders for owner ${ownerId}:`, error);
    throw error;
  }

  return data;
}

export async function createFolder(ownerId, name = 'Untitled folder') {
  const { data, error } = await supabase
    .from('folders')
    .insert([{ owner_id: ownerId, name }])
    .select()
    .single();

  if (error) {
    console.error('Error creating folder:', error);
    throw error;
  }

  return data;
}

export async function renameFolder(id, newName) {
  const { data, error } = await supabase
    .from('folders')
    .update({ name: newName })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error renaming folder ${id}:`, error);
    throw error;
  }

  return data;
}

export async function deleteFolder(id) {
  // Canvases are automatically set to folder_id = null if ON DELETE SET NULL is configured in the database,
  // but to be safe we can also explicitly update them here.
  await supabase
    .from('canvases')
    .update({ folder_id: null })
    .eq('folder_id', id);

  const { error } = await supabase
    .from('folders')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting folder ${id}:`, error);
    throw error;
  }
}

export async function updateCanvasFolder(canvasId, folderId) {
  const { data, error } = await supabase
    .from('canvases')
    .update({ folder_id: folderId })
    .eq('id', canvasId)
    .select()
    .single();

  if (error) {
    console.error(`Error updating canvas folder ${canvasId}:`, error);
    throw error;
  }

  return data;
}

// ==========================================
// Tag API
// ==========================================

export async function listTags(ownerId) {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('owner_id', ownerId)
    .order('name', { ascending: true });

  if (error) {
    console.error(`Error fetching tags for owner ${ownerId}:`, error);
    throw error;
  }

  return data;
}

export async function createTag(ownerId, name, color) {
  const { data, error } = await supabase
    .from('tags')
    .insert([{ owner_id: ownerId, name, color }])
    .select()
    .single();

  if (error) {
    console.error('Error creating tag:', error);
    throw error;
  }

  return data;
}

export async function deleteTag(id) {
  const { error } = await supabase
    .from('tags')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting tag ${id}:`, error);
    throw error;
  }
}

export async function assignTagToCanvas(canvasId, tagId) {
  const { error } = await supabase
    .from('canvas_tags')
    .insert([{ canvas_id: canvasId, tag_id: tagId }]);

  if (error) {
    console.error(`Error assigning tag ${tagId} to canvas ${canvasId}:`, error);
    throw error;
  }
}

export async function removeTagFromCanvas(canvasId, tagId) {
  const { error } = await supabase
    .from('canvas_tags')
    .delete()
    .match({ canvas_id: canvasId, tag_id: tagId });

  if (error) {
    console.error(`Error removing tag ${tagId} from canvas ${canvasId}:`, error);
    throw error;
  }
}

/**
 * Migrates an anonymous canvas to an authenticated user's account.
 * @param {string} canvasId 
 * @param {string} newOwnerId 
 * @returns {Promise<Object|null>}
 */
export async function migrateAnonymousCanvas(canvasId, newOwnerId) {
  const { data, error } = await supabase
    .from('canvases')
    .update({
      is_anonymous: false,
      owner_id: newOwnerId,
      expires_at: null
    })
    .eq('id', canvasId)
    .is('owner_id', null)
    .eq('is_anonymous', true);
    
  if (error) {
    console.error("Migration failed:", error);
    throw error;
  }
  return data;
}

// Sharing API

export async function updateCanvasAccess(canvasId, accessLevel) {
  const { data, error } = await supabase
    .from('canvases')
    .update({ canvas_access: accessLevel })
    .eq('id', canvasId);
  if (error) throw error;
  return data;
}

export async function addCollaborator(canvasId, email, role) {
  const { data, error } = await supabase
    .from('canvas_collaborators')
    .insert([{ canvas_id: canvasId, email: email.toLowerCase(), role }])
    .select();
  if (error) throw error;
  if (!data || data.length === 0) throw new Error("Insert blocked by RLS");
  return data[0];
}

export async function removeCollaborator(id) {
  const { error } = await supabase
    .from('canvas_collaborators')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function updateCollaboratorRole(id, role) {
  const { data, error } = await supabase
    .from('canvas_collaborators')
    .update({ role })
    .eq('id', id)
    .select();
  if (error) throw error;
  if (!data || data.length === 0) throw new Error("Update blocked by database (RLS policy or row not found).");
  return data[0];
}

/**
 * Saves a new historical snapshot for a canvas.
 * @param {string} canvasId - The ID of the canvas.
 * @param {Object} snapshot - The JSON snapshot payload.
 * @param {string} [userId] - Optional author ID.
 * @returns {Promise<Object>} The inserted row data.
 */
export async function saveHistorySnapshot(canvasId, snapshot, userId = null) {
  const { data, error } = await supabase
    .from('canvas_history')
    .insert([{
      canvas_id: canvasId,
      snapshot: snapshot,
      author_id: userId
    }])
    .select()
    .single();

  if (error) {
    console.error(`Error saving history snapshot for ${canvasId}:`, error);
    throw error;
  }
  return data;
}

/**
 * Retrieves the timeline of snapshots for a given canvas.
 * @param {string} canvasId - The ID of the canvas.
 * @returns {Promise<Array>} Array of snapshot records ordered chronologically.
 */
export async function getHistorySnapshots(canvasId) {
  const { data, error } = await supabase
    .from('canvas_history')
    .select('id, created_at, author_id, snapshot')
    .eq('canvas_id', canvasId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error(`Error fetching history snapshots for ${canvasId}:`, error);
    throw error;
  }
  return data;
}
