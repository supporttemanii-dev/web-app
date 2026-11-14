/* store.js — penyimpanan lokal (IndexedDB) untuk antrean offline & cache master */
const Store = (() => {
  const DB = 'skm_sehat', VER = 1;
  let dbp = null;
  function db() {
    if (dbp) return dbp;
    dbp = new Promise((res, rej) => {
      const r = indexedDB.open(DB, VER);
      r.onupgradeneeded = () => {
        const d = r.result;
        if (!d.objectStoreNames.contains('queue')) d.createObjectStore('queue', { keyPath: 'client_uuid' });
        if (!d.objectStoreNames.contains('cache')) d.createObjectStore('cache');
      };
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
    return dbp;
  }
  async function tx(store, mode, fn) {
    const d = await db();
    return new Promise((res, rej) => {
      const t = d.transaction(store, mode);
      const s = t.objectStore(store);
      const out = fn(s);
      t.oncomplete = () => res(out && out.result !== undefined ? out.result : out);
      t.onerror = () => rej(t.error);
    });
  }
  return {
    put: (store, val, key) => tx(store, 'readwrite', s => s.put(val, key)),
    get: (store, key) => tx(store, 'readonly', s => s.get(key)),
    del: (store, key) => tx(store, 'readwrite', s => s.delete(key)),
    all: (store) => tx(store, 'readonly', s => s.getAll()),
    count: (store) => tx(store, 'readonly', s => s.count()),
    clear: (store) => tx(store, 'readwrite', s => s.clear())
  };
})();
