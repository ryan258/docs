// src/extensions/dashboard/pages/my-page/my-page.tsx
import React, { useEffect, useState } from 'react';
import { Page, WixDesignSystemProvider } from '@wix/design-system';
import '@wix/design-system/styles.global.css';
import { locations } from '@wix/business-tools';
import { loadLocationsPage, type LocationPage } from './location-model.mjs';

type View =
  | { status: 'loading' }
  | { status: 'success'; page: LocationPage }
  | { status: 'error' };

export default function DashboardPage() {
  const [view, setView] = useState<View>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setView({ status: 'loading' });
    loadLocationsPage(options => locations.listLocations(options))
      .then(page => {
        if (active) setView({ status: 'success', page });
      })
      .catch(() => {
        if (active) setView({ status: 'error' });
      });
    return () => { active = false; };
  }, [attempt]);

  const status = view.status === 'loading'
    ? 'Loading locations…'
    : view.status === 'success'
      ? `${view.page.rows.length} location(s) returned.`
      : '';

  return (
    <WixDesignSystemProvider>
      <Page>
        <Page.Header title="Business locations" subtitle="Locations for this installed site" />
        <Page.Content>
          <section aria-label="Business locations list">
            <p role="status" aria-live="polite">{status}</p>
            <button
              type="button"
              disabled={view.status === 'loading'}
              onClick={() => setAttempt(value => value + 1)}
              style={{ minHeight: 44, padding: '8px 16px' }}
            >
              {view.status === 'error' ? 'Retry' : 'Refresh locations'}
            </button>
            {view.status === 'error' && (
              <p role="alert">Locations could not be loaded. Choose Retry.</p>
            )}
            {view.status === 'success' && view.page.rows.length === 0 && (
              <p>No locations returned. Add one in this site's Settings → Business Info, then refresh.</p>
            )}
            {view.status === 'success' && view.page.rows.length > 0 && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', textAlign: 'left' }}>
                  <caption>First page: up to 50 non-archived locations.</caption>
                  <thead>
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">Address</th>
                      <th scope="col">Time zone</th>
                      <th scope="col">Default</th>
                    </tr>
                  </thead>
                  <tbody>
                    {view.page.rows.map(row => (
                      <tr key={row.id}>
                        <td>{row.name}</td>
                        <td>{row.address}</td>
                        <td>{row.timeZone}</td>
                        <td>{row.isDefault ? 'Default' : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {view.status === 'success' && view.page.hasMore === true && (
              <p>More locations are available. Open Settings → Business Info for the full list.</p>
            )}
          </section>
        </Page.Content>
      </Page>
    </WixDesignSystemProvider>
  );
}
