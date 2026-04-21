import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DEFAULT_WIZARD_ENVELOPE,
  normalizeWizardState,
  type WizardEnvelope,
  type WizardState,
} from './wizardState';

const STORAGE_KEY = 'returning-shelves:woz-state';
const POLL_INTERVAL_MS = 450;

type SyncTransport = 'server' | 'local';

function isBrowser() {
  return typeof window !== 'undefined';
}

function readLocalEnvelope(): WizardEnvelope | null {
  if (!isBrowser()) return null;

  const rawValue = window.localStorage.getItem(STORAGE_KEY);
  if (!rawValue) return null;

  try {
    const parsed = JSON.parse(rawValue) as WizardEnvelope;
    if (typeof parsed?.revision !== 'number' || !parsed?.state) return null;

    return {
      revision: parsed.revision,
      state: normalizeWizardState(parsed.state),
    };
  } catch {
    return null;
  }
}

function writeLocalEnvelope(envelope: WizardEnvelope) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
}

async function readRemoteEnvelope(signal?: AbortSignal): Promise<WizardEnvelope> {
  const response = await fetch('/__woz_state', {
    headers: { Accept: 'application/json' },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch wizard state: ${response.status}`);
  }

  const parsed = (await response.json()) as WizardEnvelope;

  return {
    revision: typeof parsed.revision === 'number' ? parsed.revision : 0,
    state: normalizeWizardState(parsed.state),
  };
}

async function writeRemoteEnvelope(envelope: WizardEnvelope) {
  const response = await fetch('/__woz_state', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(envelope),
  });

  if (!response.ok) {
    throw new Error(`Failed to persist wizard state: ${response.status}`);
  }
}

function getInitialEnvelope(): WizardEnvelope {
  return readLocalEnvelope() ?? DEFAULT_WIZARD_ENVELOPE;
}

export function useSharedWizardState() {
  const [envelope, setEnvelope] = useState<WizardEnvelope>(getInitialEnvelope);
  const [transport, setTransport] = useState<SyncTransport>('local');
  const envelopeRef = useRef(envelope);

  useEffect(() => {
    envelopeRef.current = envelope;
  }, [envelope]);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const syncEnvelope = async () => {
      try {
        const remoteEnvelope = await readRemoteEnvelope(controller.signal);
        if (cancelled) return;

        setTransport('server');
        setEnvelope((currentEnvelope) =>
          remoteEnvelope.revision > currentEnvelope.revision ? remoteEnvelope : currentEnvelope,
        );
        writeLocalEnvelope(remoteEnvelope);
      } catch {
        if (cancelled) return;

        setTransport('local');
        const localEnvelope = readLocalEnvelope();
        if (localEnvelope && localEnvelope.revision > envelopeRef.current.revision) {
          setEnvelope(localEnvelope);
        }
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;

      const localEnvelope = readLocalEnvelope();
      if (localEnvelope && localEnvelope.revision > envelopeRef.current.revision) {
        setEnvelope(localEnvelope);
      }
    };

    void syncEnvelope();
    const intervalId = window.setInterval(syncEnvelope, POLL_INTERVAL_MS);
    window.addEventListener('storage', handleStorage);

    return () => {
      cancelled = true;
      controller.abort();
      window.clearInterval(intervalId);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const setState = useCallback(
    async (nextStateOrUpdater: WizardState | ((currentState: WizardState) => WizardState)) => {
      let nextEnvelope: WizardEnvelope | null = null;

      setEnvelope((currentEnvelope) => {
        const nextState =
          typeof nextStateOrUpdater === 'function'
            ? nextStateOrUpdater(currentEnvelope.state)
            : nextStateOrUpdater;

        nextEnvelope = {
          revision: currentEnvelope.revision + 1,
          state: normalizeWizardState(nextState),
        };

        envelopeRef.current = nextEnvelope;
        writeLocalEnvelope(nextEnvelope);
        return nextEnvelope;
      });

      if (!nextEnvelope) return;

      try {
        await writeRemoteEnvelope(nextEnvelope);
        setTransport('server');
      } catch {
        setTransport('local');
      }
    },
    [],
  );

  return {
    revision: envelope.revision,
    state: envelope.state,
    transport,
    setState,
  };
}
