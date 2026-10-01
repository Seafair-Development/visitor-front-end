// Server-only reader for Aaron's Asana master to-do list (kept up to date by
// the "Master task list" scheduled task every 2 hours).

const DEFAULT_PROJECT_GID = '1218887919463767'; // "Aaron – Master List"

export async function loadAsanaTodos() {
  const token = process.env.ASANA_ACCESS_TOKEN;
  if (!token) return { configured: false, sections: [] };
  const project = process.env.ASANA_PROJECT_GID || DEFAULT_PROJECT_GID;

  const params = new URLSearchParams({
    project,
    // Only tasks that are incomplete (or completed after "now", i.e. none).
    completed_since: 'now',
    limit: '100',
    opt_fields:
      'name,due_on,due_at,completed,permalink_url,memberships.project.gid,memberships.section.name',
  });
  const tasks = [];
  let url = `https://app.asana.com/api/1.0/tasks?${params}`;
  while (url) {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`Asana ${res.status}: ${await res.text()}`);
    const body = await res.json();
    tasks.push(...body.data);
    url = body.next_page?.uri || null;
  }

  const bySection = new Map();
  for (const t of tasks) {
    if (t.completed) continue;
    const membership = t.memberships?.find((m) => m.project?.gid === project);
    const section = membership?.section?.name || 'Unsorted';
    if (!bySection.has(section)) bySection.set(section, []);
    bySection.get(section).push({
      id: t.gid,
      title: t.name,
      dueAt: t.due_at || (t.due_on ? `${t.due_on}T12:00:00-04:00` : null),
      dueDateOnly: !t.due_at && !!t.due_on,
      url: t.permalink_url,
      aboutIsabella: /isabella/i.test(t.name),
    });
  }

  // Sections are named "🔴 P1 – …", "🟠 P2 – …" etc.; sort by that priority.
  const rank = (name) => {
    const m = name.match(/P(\d)/);
    if (m) return Number(m[1]);
    return /waiting/i.test(name) ? 5 : 6;
  };
  const sections = [...bySection.entries()]
    .map(([name, items]) => ({
      name: name === 'Untitled section' ? 'Unsorted' : name,
      items: items.sort((a, b) => (a.dueAt || '9999').localeCompare(b.dueAt || '9999')),
    }))
    .sort((a, b) => rank(a.name) - rank(b.name));

  return { configured: true, projectGid: project, sections };
}
