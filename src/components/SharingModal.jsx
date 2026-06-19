import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Globe, Lock, Loader2, Trash2, Check } from 'lucide-react';
import { updateCanvasAccess, addCollaborator, removeCollaborator, updateCollaboratorRole } from '../lib/canvasApi';

export default function SharingModal({ isOpen, onClose, canvasMeta, setCanvasMeta }) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');
  const [loadingInvite, setLoadingInvite] = useState(false);
  const [loadingAccess, setLoadingAccess] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !canvasMeta) return null;

  const accessLevel = canvasMeta.canvas_access || 'edit';
  const collaborators = canvasMeta.canvas_collaborators || [];

  const handleCopyLink = async () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('new');
      await navigator.clipboard.writeText(url.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleAccessChange = async (e) => {
    const newAccess = e.target.value;
    setLoadingAccess(true);
    try {
      await updateCanvasAccess(canvasMeta.id, newAccess);
      setCanvasMeta(prev => ({ ...prev, canvas_access: newAccess }));
    } catch (err) {
      console.error(err);
      alert("Failed to update access");
    }
    setLoadingAccess(false);
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setLoadingInvite(true);
    try {
      const newCollab = await addCollaborator(canvasMeta.id, inviteEmail.trim(), inviteRole);
      setCanvasMeta(prev => ({
        ...prev,
        canvas_collaborators: [...(prev.canvas_collaborators || []), newCollab]
      }));
      setInviteEmail('');
    } catch (err) {
      console.error(err);
      alert(err.code === '23505' ? 'User is already invited' : 'Failed to invite user');
    }
    setLoadingInvite(false);
  };

  const handleRemoveCollab = async (collabId) => {
    try {
      await removeCollaborator(collabId);
      setCanvasMeta(prev => ({
        ...prev,
        canvas_collaborators: prev.canvas_collaborators.filter(c => c.id !== collabId)
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to remove collaborator");
    }
  };

  const handleChangeRole = async (collabId, newRole) => {
    try {
      const updated = await updateCollaboratorRole(collabId, newRole);
      setCanvasMeta(prev => ({
        ...prev,
        canvas_collaborators: prev.canvas_collaborators.map(c => c.id === collabId ? updated : c)
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to update role: " + (err.message || err));
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Share Canvas</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-6">
          {/* General Access */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900">General Access</h3>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                {accessLevel === 'private' ? <Lock size={18} className="text-gray-500" /> : <Globe size={18} className="text-blue-500" />}
              </div>
              <div className="flex-1">
                <select 
                  value={accessLevel}
                  onChange={handleAccessChange}
                  disabled={loadingAccess}
                  className="w-full bg-transparent font-medium text-sm text-gray-900 outline-none cursor-pointer"
                >
                  <option value="private">Private (Only you & invited)</option>
                  <option value="view">Anyone with the link can view</option>
                  <option value="edit">Anyone with the link can edit</option>
                </select>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Explicit Invites */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Invite Collaborators</h3>
            <form onSubmit={handleInvite} className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email address" 
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                required
                className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <select 
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value)}
                className="px-2 py-2 bg-white border border-gray-200 rounded-lg text-sm outline-none cursor-pointer focus:border-blue-500"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
              </select>
              <button 
                type="submit" 
                disabled={loadingInvite || !inviteEmail}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-1"
              >
                {loadingInvite ? <Loader2 size={16} className="animate-spin" /> : "Invite"}
              </button>
            </form>

            {/* List */}
            <div className="space-y-2 mt-4 max-h-40 overflow-y-auto">
              {collaborators.length === 0 ? (
                <div className="text-xs text-gray-500 italic text-center py-2">No collaborators invited yet</div>
              ) : (
                collaborators.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg group transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
                        {c.email.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="text-sm font-medium text-gray-900">{c.email}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select 
                        value={c.role}
                        onChange={(e) => handleChangeRole(c.id, e.target.value)}
                        className="text-xs font-medium text-gray-600 bg-transparent outline-none cursor-pointer hover:bg-gray-200 p-1 rounded"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                      </select>
                      <button 
                        onClick={() => handleRemoveCollab(c.id)}
                        className="p-1 text-gray-400 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-gray-100 flex justify-between items-center">
             <span className="text-xs text-gray-500 font-medium">Link gives access based on settings above</span>
             <button 
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-semibold transition-colors"
             >
                {copied ? <Check size={16} className="text-green-600" /> : <Globe size={16} />}
                {copied ? 'Copied!' : 'Copy Link'}
             </button>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
}
