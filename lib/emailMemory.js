// Server-only helpers for the emailmemory Supabase project. The scheduled
// robots (Gmail sync -> memories/events, Toddle crawler -> toddle_items) write
// here; the dashboard only reads, plus marking Aaron's memories done.

const TZ = 'America/New_York';
const PAST_DUE_WINDOW_DAYS = 14;
const UPCOMING_EVENT_DAYS = 14;

function config() {
  const url = process.env.EMAILMEMORY_SUPABASE_URL;
  const key = process.env.EMAILMEMORY_SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      'Set EMAILMEMORY_SUPABASE_URL and EMAILMEMORY_SUPABASE_SERVICE_ROLE_KEY to load the dashboard.'
    );
  }
  return { url: url.replace(/\/$/, ''), key };
}

async function rest(path, init = {}) {
  const { url, key } = config();
  const res = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  }
  return res.status === 204 ? null : res.json();
}

function daysFromNow(days) {
  return new Date(Date.now() + days * 86400000).toISOString();
}

export async function loadDashboard() {
  const pastCutoff = daysFromNow(-PAST_DUE_WINDOW_DAYS);
  const nowIso = new Date().toISOString();
  const eventsUntil = daysFromNow(UPCOMING_EVENT_DAYS);

  const [memories, events, toddle, schoolEvents, syncRuns, toddleRuns] = await Promise.all([
    rest(
      'memories?select=id,kind,content,due_at,confidence,contacts(name)' +
        '&status=eq.active&kind=in.(commitment,deadline)' +
        `&or=(due_at.is.null,due_at.gte.${pastCutoff})` +
        '&order=due_at.asc.nullslast&limit=300'
    ),
    rest(
      'events?select=id,title,category,starts_at,all_day,location,attendance,rsvp_by,rsvp_status,status' +
        `&starts_at=gte.${nowIso}&starts_at=lte.${eventsUntil}` +
        '&status=neq.cancelled&attendance=in.(required,invited)' +
        '&order=starts_at.asc&limit=50'
    ),
    rest(
      'toddle_items?select=id,item_type,category,status,class_name,title,due_at,toddle_url' +
        '&removed_at=is.null&category=in.(ASSIGNMENT,ACTION)' +
        '&status=in.(pending,overdue,open_optional)' +
        '&order=due_at.asc.nullslast&limit=200'
    ),
    rest(
      'toddle_items?select=id,title,starts_at,toddle_url' +
        `&removed_at=is.null&item_type=eq.school_calendar_event&starts_at=gte.${nowIso}` +
        '&order=starts_at.asc&limit=10'
    ),
    rest('sync_runs?select=job,finished_at,error&order=started_at.desc&limit=1'),
    rest('toddle_runs?select=finished_at,session_ok,error&order=started_at.desc&limit=1'),
  ]);

  return {
    generatedAt: nowIso,
    aaron: {
      tasks: memories.map((m) => ({
        id: m.id,
        kind: m.kind,
        text: m.content,
        dueAt: m.due_at,
        source: m.contacts?.name || null,
        aboutIsabella: /isabella/i.test(m.content),
      })),
      events: events.map((e) => ({
        id: e.id,
        title: e.title,
        category: e.category,
        startsAt: e.starts_at,
        allDay: e.all_day,
        location: e.location,
        attendance: e.attendance,
        rsvpBy: e.rsvp_by,
        rsvpStatus: e.rsvp_status,
        tentative: e.status === 'tentative',
      })),
    },
    isabella: {
      tasks: toddle.map((t) => ({
        id: t.id,
        title: t.title,
        className: t.class_name,
        type: t.item_type,
        status: t.status,
        dueAt: t.due_at,
        url: t.toddle_url,
      })),
      schoolEvents: schoolEvents.map((e) => ({
        id: e.id,
        title: e.title,
        startsAt: e.starts_at,
        url: e.toddle_url,
      })),
    },
    robots: {
      email: syncRuns[0] || null,
      toddle: toddleRuns[0] || null,
    },
    timezone: TZ,
  };
}

const ALLOWED_STATUSES = new Set(['active', 'done', 'dismissed']);

export async function setMemoryStatus(id, status) {
  if (!ALLOWED_STATUSES.has(status)) throw new Error(`Bad status: ${status}`);
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Error('Bad id');
  await rest(`memories?id=eq.${id}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({ status, updated_at: new Date().toISOString() }),
  });
}
