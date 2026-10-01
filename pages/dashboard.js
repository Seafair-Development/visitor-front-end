// pages/dashboard.js
import React, { useState } from 'react';
import Head from 'next/head';
import { loadDashboard } from '../lib/emailMemory';
import { loadAsanaTodos } from '../lib/asana';

const TZ = 'America/New_York';

const dayKey = (iso) => new Date(iso).toLocaleDateString('en-CA', { timeZone: TZ });

function formatDue(iso, { dateOnly = false } = {}) {
  if (!iso) return '';
  const d = new Date(iso);
  const date = d.toLocaleDateString('en-US', { timeZone: TZ, weekday: 'short', month: 'short', day: 'numeric' });
  if (dateOnly) return date;
  const time = d.toLocaleTimeString('en-US', { timeZone: TZ, hour: 'numeric', minute: '2-digit' });
  // Midnight ET usually means "date only" in the source data.
  return time === '12:00 AM' ? date : `${date}, ${time}`;
}

// Buckets keyed off the ET calendar day so "today" matches Miami time.
function bucketize(items, nowIso) {
  const today = dayKey(nowIso);
  const weekEnd = dayKey(new Date(new Date(nowIso).getTime() + 7 * 86400000).toISOString());
  const buckets = { overdue: [], today: [], week: [], later: [], undated: [] };
  for (const item of items) {
    if (!item.dueAt) buckets.undated.push(item);
    else {
      const k = dayKey(item.dueAt);
      if (k < today) buckets.overdue.push(item);
      else if (k === today) buckets.today.push(item);
      else if (k <= weekEnd) buckets.week.push(item);
      else buckets.later.push(item);
    }
  }
  return buckets;
}

const BUCKET_LABELS = [
  ['overdue', 'Past due'],
  ['today', 'Today'],
  ['week', 'Next 7 days'],
  ['later', 'Later'],
  ['undated', 'No date'],
];

function Badge({ children, tone = 'neutral' }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

function MemoryTask({ task, onStatus }) {
  const [busy, setBusy] = useState(false);
  const act = async (status) => {
    setBusy(true);
    try {
      await onStatus(task.id, status);
    } finally {
      setBusy(false);
    }
  };
  return (
    <li className="task">
      <div className="task-main">
        <p className="task-text">{task.text}</p>
        <div className="meta">
          {task.dueAt && <span>{formatDue(task.dueAt)}</span>}
          {task.source && <span className="sep">{task.source}</span>}
          {task.kind === 'commitment' && <Badge tone="blue">commitment</Badge>}
          {task.aboutIsabella && <Badge tone="pink">Isabella</Badge>}
        </div>
      </div>
      <div className="actions">
        <button disabled={busy} onClick={() => act('done')} title="Mark done">Done</button>
        <button disabled={busy} className="ghost" onClick={() => act('dismissed')} title="Not a to-do">
          Dismiss
        </button>
      </div>
    </li>
  );
}

function SourceError({ error }) {
  return <p className="error">Couldn’t load: {error}</p>;
}

export default function Dashboard({ now, memory, memoryError, asana, asanaError }) {
  const [hidden, setHidden] = useState(() => new Set());
  const [actionError, setActionError] = useState(null);

  const updateMemory = async (id, status) => {
    setActionError(null);
    const res = await fetch(`/api/dashboard/memories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      setActionError((await res.json()).error || 'Update failed');
      return;
    }
    setHidden((prev) => new Set(prev).add(id));
  };

  const myTasks = memory ? memory.aaron.tasks.filter((t) => !hidden.has(t.id)) : [];
  const myBuckets = bucketize(myTasks, now);
  const isaBuckets = memory ? bucketize(memory.isabella.tasks, now) : null;
  const asanaOpen = asana?.sections?.reduce((n, s) => n + s.items.length, 0) ?? 0;
  const isaOverdue = isaBuckets ? isaBuckets.overdue.length : 0;

  return (
    <div className="page">
      <Head>
        <title>To-do dashboard</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <header>
        <div>
          <h1>To-do dashboard</h1>
          <p className="sub">
            {new Date(now).toLocaleString('en-US', { timeZone: TZ, dateStyle: 'full', timeStyle: 'short' })} ET
          </p>
        </div>
        <div className="stats">
          <div className="stat"><b>{myBuckets.overdue.length + myBuckets.today.length}</b><span>Email deadlines today / past due</span></div>
          <div className="stat"><b>{asanaOpen}</b><span>Asana open tasks</span></div>
          <div className="stat"><b>{isaOverdue}</b><span>Isabella overdue</span></div>
        </div>
      </header>

      {actionError && <p className="error">{actionError}</p>}

      <main className="grid">
        <section className="col">
          <h2>Aaron · from email memory</h2>
          {memoryError ? (
            <SourceError error={memoryError} />
          ) : (
            <>
              {BUCKET_LABELS.map(([key, label]) =>
                myBuckets[key].length ? (
                  <details key={key} open={key !== 'overdue' && key !== 'undated'} className={`bucket ${key}`}>
                    <summary>{label} <span className="count">{myBuckets[key].length}</span></summary>
                    <ul>{myBuckets[key].map((t) => <MemoryTask key={t.id} task={t} onStatus={updateMemory} />)}</ul>
                  </details>
                ) : null
              )}
              {memory.aaron.events.length > 0 && (
                <details open className="bucket">
                  <summary>On the calendar (next 14 days) <span className="count">{memory.aaron.events.length}</span></summary>
                  <ul>
                    {memory.aaron.events.map((e) => (
                      <li key={e.id} className="task">
                        <div className="task-main">
                          <p className="task-text">{e.title}</p>
                          <div className="meta">
                            <span>{formatDue(e.startsAt, { dateOnly: e.allDay })}</span>
                            {e.location && <span className="sep">{e.location}</span>}
                            <Badge tone={e.attendance === 'required' ? 'red' : 'neutral'}>{e.attendance}</Badge>
                            {e.tentative && <Badge>tentative</Badge>}
                            {e.rsvpBy && e.rsvpStatus !== 'yes' && e.rsvpStatus !== 'no' && (
                              <Badge tone="amber">RSVP by {formatDue(e.rsvpBy, { dateOnly: true })}</Badge>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </>
          )}
        </section>

        <section className="col">
          <h2>Aaron · Asana master list</h2>
          {asanaError ? (
            <SourceError error={asanaError} />
          ) : !asana.configured ? (
            <p className="muted">Set <code>ASANA_ACCESS_TOKEN</code> to show the “Aaron – Master List” project.</p>
          ) : (
            asana.sections.map((s) => (
              <details key={s.name} open={/P1|P2/.test(s.name)} className="bucket">
                <summary>{s.name} <span className="count">{s.items.length}</span></summary>
                <ul>
                  {s.items.map((t) => (
                    <li key={t.id} className="task">
                      <div className="task-main">
                        <a className="task-text" href={t.url} target="_blank" rel="noreferrer">{t.title}</a>
                        <div className="meta">
                          {t.dueAt && <span>{formatDue(t.dueAt, { dateOnly: t.dueDateOnly })}</span>}
                          {t.aboutIsabella && <Badge tone="pink">Isabella</Badge>}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </details>
            ))
          )}
        </section>

        <section className="col">
          <h2>Isabella · from Toddle</h2>
          {memoryError ? (
            <SourceError error={memoryError} />
          ) : (
            <>
              {BUCKET_LABELS.map(([key, label]) =>
                isaBuckets[key].length ? (
                  <details key={key} open className={`bucket ${key}`}>
                    <summary>{label === 'Past due' ? 'Overdue' : label} <span className="count">{isaBuckets[key].length}</span></summary>
                    <ul>
                      {isaBuckets[key].map((t) => (
                        <li key={t.id} className="task">
                          <div className="task-main">
                            {t.url ? (
                              <a className="task-text" href={t.url} target="_blank" rel="noreferrer">{t.title}</a>
                            ) : (
                              <p className="task-text">{t.title}</p>
                            )}
                            <div className="meta">
                              {t.dueAt && <span>{formatDue(t.dueAt)}</span>}
                              {t.className && <span className="sep">{t.className.replace(/^Grade 5 - /, '')}</span>}
                              {t.status === 'open_optional' && <Badge>optional</Badge>}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : null
              )}
              {memory.isabella.schoolEvents.length > 0 && (
                <details className="bucket">
                  <summary>School calendar <span className="count">{memory.isabella.schoolEvents.length}</span></summary>
                  <ul>
                    {memory.isabella.schoolEvents.map((e) => (
                      <li key={e.id} className="task">
                        <div className="task-main">
                          <p className="task-text">{e.title}</p>
                          <div className="meta"><span>{formatDue(e.startsAt, { dateOnly: true })}</span></div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </>
          )}
        </section>
      </main>

      {memory && (
        <footer>
          Email robot last finished{' '}
          {memory.robots.email?.finished_at ? formatDue(memory.robots.email.finished_at) : 'never'}
          {memory.robots.email?.error && ' (with errors)'} · Toddle robot last finished{' '}
          {memory.robots.toddle?.finished_at ? formatDue(memory.robots.toddle.finished_at) : 'never'}
          {memory.robots.toddle && memory.robots.toddle.session_ok === false && ' (login failed)'}
        </footer>
      )}

      <style jsx global>{`
        :root {
          --bg: #f6f7f9; --card: #fff; --text: #1d2330; --muted: #677085; --line: #e3e6ec;
          --accent: #2457d6; --red: #c0352b; --amber: #a86400; --pink: #b03a78; --blue: #2457d6;
        }
        @media (prefers-color-scheme: dark) {
          :root {
            --bg: #12151b; --card: #1b1f27; --text: #e7eaf0; --muted: #98a1b3; --line: #2b313c;
            --accent: #7aa2ff; --red: #ff7b72; --amber: #e3b341; --pink: #f08cc0; --blue: #7aa2ff;
          }
        }
        body { margin: 0; background: var(--bg); color: var(--text);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; }
      `}</style>
      <style jsx>{`
        .page { max-width: 1400px; margin: 0 auto; padding: 24px 16px 48px; }
        header { display: flex; flex-wrap: wrap; gap: 16px; justify-content: space-between; align-items: flex-end; margin-bottom: 20px; }
        h1 { margin: 0; font-size: 1.8rem; }
        .sub { margin: 4px 0 0; color: var(--muted); }
        .stats { display: flex; gap: 12px; flex-wrap: wrap; }
        .stat { background: var(--card); border: 1px solid var(--line); border-radius: 10px; padding: 10px 14px; min-width: 130px; }
        .stat b { display: block; font-size: 1.5rem; }
        .stat span { color: var(--muted); font-size: 0.8rem; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px; align-items: start; }
        .col { background: var(--card); border: 1px solid var(--line); border-radius: 12px; padding: 16px; min-width: 0; }
        h2 { font-size: 1.05rem; margin: 0 0 12px; }
        .error { color: var(--red); }
        .muted { color: var(--muted); }
        footer { margin-top: 24px; color: var(--muted); font-size: 0.8rem; }
      `}</style>
      <style jsx global>{`
        .bucket { border-top: 1px solid var(--line); padding: 8px 0; }
        .bucket summary { cursor: pointer; font-weight: 600; list-style: revert; }
        .bucket.overdue summary { color: var(--red); }
        .bucket .count { color: var(--muted); font-weight: 400; margin-left: 4px; }
        .bucket ul { list-style: none; margin: 8px 0 0; padding: 0; }
        .task { display: flex; gap: 8px; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed var(--line); }
        .task:last-child { border-bottom: 0; }
        .task-main { min-width: 0; }
        .task-text { margin: 0; line-height: 1.35; color: var(--text); overflow-wrap: anywhere; }
        a.task-text { text-decoration: none; }
        a.task-text:hover { color: var(--accent); text-decoration: underline; }
        .meta { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; margin-top: 4px; font-size: 0.8rem; color: var(--muted); }
        .meta .sep:not(:first-child)::before { content: "· "; }
        .badge { border: 1px solid currentColor; border-radius: 999px; padding: 0 7px; font-size: 0.72rem; }
        .badge.red { color: var(--red); } .badge.amber { color: var(--amber); }
        .badge.pink { color: var(--pink); } .badge.blue { color: var(--blue); }
        .actions { display: flex; flex-direction: column; gap: 4px; flex-shrink: 0; }
        .actions button { font-size: 0.75rem; padding: 3px 8px; border-radius: 6px; border: 1px solid var(--accent);
          background: var(--accent); color: var(--card); cursor: pointer; }
        .actions button.ghost { background: transparent; color: var(--muted); border-color: var(--line); }
        .actions button:disabled { opacity: 0.5; cursor: default; }
      `}</style>
    </div>
  );
}

export async function getServerSideProps({ res }) {
  res.setHeader('Cache-Control', 'private, no-store');
  const [memory, asana] = await Promise.allSettled([loadDashboard(), loadAsanaTodos()]);
  return {
    props: {
      now: new Date().toISOString(),
      memory: memory.status === 'fulfilled' ? memory.value : null,
      memoryError: memory.status === 'rejected' ? memory.reason.message : null,
      asana: asana.status === 'fulfilled' ? asana.value : null,
      asanaError: asana.status === 'rejected' ? asana.reason.message : null,
    },
  };
}
