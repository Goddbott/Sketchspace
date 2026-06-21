import { useEffect, useState } from 'react';
import { createTLStore, defaultShapeUtils } from 'tldraw';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { IndexeddbPersistence } from 'y-indexeddb';
import { EquationShapeUtil } from '../shapes/EquationShapeUtil';
import { GraphShapeUtil } from '../shapes/GraphShapeUtil';

const customShapeUtils = [...defaultShapeUtils, EquationShapeUtil, GraphShapeUtil];

// A basic hook to connect tldraw to Yjs for real-time collaboration
export function useYjsStore(roomId = 'sketchspace-room', onColdStart = null, identity = null) {
  const [store] = useState(() => createTLStore({ shapeUtils: customShapeUtils }));
  const [storeWithStatus, setStoreWithStatus] = useState({
    store,
    status: 'loading',
    connectionStatus: 'connecting',
    provider: null,
  });

  useEffect(() => {
    setStoreWithStatus(prev => ({ ...prev, status: 'loading' }));

    // Initialize Yjs Document
    const yDoc = new Y.Doc();
    const yStore = yDoc.getMap('tldraw');

    // Setup Local Persistence (Step 4)
    const indexeddbProvider = new IndexeddbPersistence(roomId, yDoc);
    
    // Determine the correct WebSocket protocol and URL
    const HTTP_URL = import.meta.env.VITE_SYNC_SERVER_URL || 'http://127.0.0.1:5858';
    const wsProtocol = HTTP_URL.startsWith('https') ? 'wss' : 'ws';
    const WS_URL = HTTP_URL.replace(/^https?/, wsProtocol);

    console.log(`[Yjs] Connecting to room ${roomId} at ${WS_URL}`);

    // Connect to our standalone y-websocket server
    const provider = new WebsocketProvider(WS_URL, roomId, yDoc);

    // STEP 2: Set up Yjs Awareness
    if (identity) {
      provider.awareness.setLocalStateField('user', identity);
      
      // Expose for easy testing in the browser console (as requested in Step 2)
      window.getAwarenessStates = () => {
        const states = Array.from(provider.awareness.getStates().entries());
        console.table(states.map(([id, state]) => ({ clientID: id, ...state.user })));
        return states;
      };
    }

    const unsubs = [];
    let hasSynced = false;

    // Step 3: Bind Yjs to tldraw Store
    const handleSync = () => {
      // 1. Send all tldraw local changes to Yjs
      unsubs.push(
        store.listen(
          ({ changes }) => {
            yDoc.transact(() => {
              Object.values(changes.added).forEach((record) => {
                yStore.set(record.id, record);
              });
              Object.values(changes.updated).forEach(([_, record]) => {
                yStore.set(record.id, record);
              });
              Object.keys(changes.removed).forEach((id) => {
                yStore.delete(id);
              });
            });
          },
          { source: 'user', scope: 'document' }
        )
      );

      // 2. Receive remote changes from Yjs and apply to tldraw
      const handleYjsChange = (events, transaction) => {
        // Ignore changes that were made locally
        if (transaction.local) return;

        const toRemove = [];
        const toPut = [];

        events.forEach((event) => {
          event.changes.keys.forEach((change, id) => {
            switch (change.action) {
              case 'add':
              case 'update':
                const val = yStore.get(id);
                if (val) toPut.push(val);
                break;
              case 'delete':
                toRemove.push(id);
                break;
            }
          });
        });

        if (toPut.length > 0 || toRemove.length > 0) {
          store.mergeRemoteChanges(() => {
            if (toRemove.length > 0) store.remove(toRemove);
            if (toPut.length > 0) store.put(toPut);
          });
        }
      };

      yStore.observeDeep(handleYjsChange);
      unsubs.push(() => yStore.unobserveDeep(handleYjsChange));
      
      // Step 6: Initialize tldraw store with what's currently in Yjs
      const initialRecords = Array.from(yStore.values());
      if (initialRecords.length > 0) {
        store.mergeRemoteChanges(() => {
          store.put(initialRecords);
        });
      } else if (onColdStart) {
        // Cold start! Room is completely empty. Ask Supabase for the last snapshot.
        console.log('[Yjs] Room is empty, attempting cold start from Supabase...');
        onColdStart().then(snapshot => {
          if (snapshot && snapshot.store) {
            yDoc.transact(() => {
              for (const record of Object.values(snapshot.store)) {
                yStore.set(record.id, record);
              }
            });
            console.log('[Yjs] Cold start successful!');
          }
        }).catch(err => console.error('[Yjs] Cold start failed:', err));
      }
    };

    indexeddbProvider.on('synced', () => {
      console.log('[Yjs] IndexedDB synced');
      if (!hasSynced) {
        hasSynced = true;
        handleSync();
        setStoreWithStatus(prev => ({ ...prev, status: 'synced-remote' }));
      }
    });

    provider.on('synced', () => {
      console.log('[Yjs] WebSocket synced');
      if (!hasSynced) {
        hasSynced = true;
        handleSync();
        setStoreWithStatus(prev => ({ ...prev, status: 'synced-remote', provider }));
      }
    });

    provider.on('status', ({ status }) => {
      console.log(`[Yjs] Connection status changed: ${status}`);
      setStoreWithStatus(prev => ({
        ...prev,
        connectionStatus: status === 'connected' ? 'online' : 'offline',
        provider
      }));
    });

    const handleBeforeUnload = () => {
      provider.awareness.setLocalState(null);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      unsubs.forEach(fn => fn());
      provider.awareness.setLocalState(null);
      provider.disconnect();
      yDoc.destroy();
    };
  }, [roomId, store]);

  return storeWithStatus;
}
