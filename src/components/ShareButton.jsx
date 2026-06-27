import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import SharingModal from './SharingModal';

export default function ShareButton({ canvasMeta, setCanvasMeta, user }) {
  const [copied, setCopied] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Is the current user the owner of this canvas?
  const isOwner = user && canvasMeta && canvasMeta.owner_id === user.id;

  const handleShare = async () => {
    if (isOwner) {
      setModalOpen(true);
    } else {
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('new');
        await navigator.clipboard.writeText(url.toString());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
    }
  };

  return (
    <>
      <button
        onClick={handleShare}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors text-xs font-semibold border border-blue-100 dark:border-blue-800/50"
      >
        {copied ? <Check size={14} /> : <Share2 size={14} />}
        {copied ? 'Copied!' : 'Share'}
      </button>

      {isOwner && (
        <SharingModal 
          isOpen={modalOpen} 
          onClose={() => setModalOpen(false)} 
          canvasMeta={canvasMeta}
          setCanvasMeta={setCanvasMeta}
        />
      )}
    </>
  );
}
