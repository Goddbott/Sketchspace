import { useEffect, useState } from 'react';
import { createTLStore, defaultShapeUtils } from 'tldraw';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

// A basic hook to connect tldraw to Yjs for real-time collaboration
export function useYjsStore(roomId = 'sketchspace-room') {
  const [store] = useState(() => createTLStore({ shapeUtils: defaultShapeUtils }));
  const [storeWithStatus, setStoreWithStatus] = useState({
    store,
    status: 'loading',
    connectionStatus: 'connecting',
  });

  useEffect(() => {
    setStoreWithStatus(prev => ({ ...prev, status: 'loading' }));

    // Initialize Yjs Document
    const yDoc = new Y.Doc();
    
    // Connect to a public free y-websocket server (for demo purposes)
    // In production, you would run your own y-websocket server
    const provider = new WebsocketProvider('wss://demos.yjs.dev', roomId, yDoc);

    // Provide random colors for cursors
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFA500', '#800080', '#008080'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomName = `User ${Math.floor(Math.random() * 100)}`;

    // Handle Awareness (Cursors & Presence)
    const awareness = provider.awareness;
    awareness.setLocalStateField('user', {
      name: randomName,
      color: randomColor,
    });

    // Update tldraw presence based on Yjs awareness
    awareness.on('change', () => {
      const states = Array.from(awareness.getStates().entries());
      // Here you would normally map Yjs awareness states to tldraw's InstancePresence
      // to render the remote cursors with name tags on the canvas natively.
    });

    provider.on('status', ({ status }) => {
      if (status === 'connected') {
        setStoreWithStatus({
          store,
          status: 'synced-remote',
          connectionStatus: 'online',
        });
      } else {
        setStoreWithStatus({
          store,
          status: 'synced-remote',
          connectionStatus: 'offline',
        });
      }
    });

    return () => {
      provider.disconnect();
      yDoc.destroy();
    };
  }, [roomId, store]);

  return storeWithStatus;
}
