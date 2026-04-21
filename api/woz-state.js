const DEFAULT_WIZARD_ENVELOPE = {
  revision: 0,
  state: {
    screenMode: 'landing',
    selectionMode: 'multi',
    locatorReturnMode: 'multi',
    locatorContext: 'base',
    activeTab: 'Designer',
    activeSelectedBookId: 'words',
    selectedBookIds: ['cynophile', 'macguffin', 'mind-walks', 'words'],
    viewMode: 'base',
  },
};

const STORE_KEY = '__RETURNING_SHELVES_WIZARD_STATE__';

function getStore() {
  if (!globalThis[STORE_KEY]) {
    globalThis[STORE_KEY] = {
      envelope: DEFAULT_WIZARD_ENVELOPE,
    };
  }

  return globalThis[STORE_KEY];
}

function parseEnvelope(body) {
  const payload = typeof body === 'string' ? JSON.parse(body) : body;

  if (typeof payload?.revision !== 'number' || !payload?.state || typeof payload.state !== 'object') {
    throw new Error('Invalid wizard state payload');
  }

  return payload;
}

export default function handler(req, res) {
  const store = getStore();

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method === 'GET') {
    res.status(200).end(JSON.stringify(store.envelope));
    return;
  }

  if (req.method === 'POST') {
    try {
      store.envelope = parseEnvelope(req.body);
      res.status(200).end(JSON.stringify(store.envelope));
    } catch {
      res.status(400).end(JSON.stringify({ error: 'Invalid wizard state payload' }));
    }
    return;
  }

  res.setHeader('Allow', 'GET, POST');
  res.status(405).end(JSON.stringify({ error: 'Method not allowed' }));
}
