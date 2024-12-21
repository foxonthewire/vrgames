// service-worker.js
self.addEventListener('install', (event) => {
  console.log('Service Worker installed.');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated.');
});

self.addEventListener('message', async (event) => {
  if (event.data && event.data.type === 'SCAN_OBJECT') {
    const scanObject = async (obj, path = '') => {
      const keys = Object.keys(obj);
      const output = [];
      for (const key of keys) {
        try {
          const value = obj[key];
          const fullPath = path ? `${path}.${key}` : key;
          output.push(`${fullPath}: ${value}`);
          if (typeof value === 'object' && value !== null) {
            output.push(...(await scanObject(value, fullPath)));
          }
        } catch (e) {
          output.push(`${path}.${key}: [inaccessible]`);
        }
      }
      return output;
    };

    const windowData = await scanObject(self); // Scan the worker's global scope
    event.source.postMessage({ type: 'SCAN_RESULT', data: windowData });
  }
});
