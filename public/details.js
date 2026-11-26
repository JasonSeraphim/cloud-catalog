const page = document.body.dataset.page;
const content = document.getElementById('content');
const summary = document.getElementById('summary');
const refresh = document.getElementById('refresh');

function element(tag, className, text) {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function field(label, value) {
  const group = element('div', 'field');
  group.append(element('div', 'label', label), element('p', 'value', value));
  return group;
}

async function load() {
  refresh.disabled = true;
  content.setAttribute('aria-busy', 'true');
  summary.textContent = 'Loading…';
  try {
    const response = await fetch(`/api/${page}`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Unable to load data');
    const data = await response.json();
    const panel = element('div', page === 'services' ? 'grid' : 'card status-panel');
    if (page === 'services') {
      if (!Array.isArray(data)) throw new Error('Invalid service data');
      for (const service of data) {
        const card = element('article', 'card');
        const top = element('div', 'card-top');
        top.append(element('span', 'id', service.serviceId), element('span', 'badge', service.category));
        card.append(top, element('h2', '', service.serviceName), field('Pricing model', service.pricingModel));
        panel.append(card);
      }
      if (!data.length) panel.append(element('p', 'message', 'No services are currently listed.'));
      summary.textContent = `${data.length} services in the catalog`;
    } else {
      if (!data || typeof data.status !== 'string' || typeof data.developer !== 'string' || typeof data.environment !== 'string') throw new Error('Invalid status data');
      const heading = element('div', 'status-heading');
      if (data.status === 'Operational') {
        const dot = element('span', 'dot');
        dot.setAttribute('aria-hidden', 'true');
        heading.append(dot);
      }
      heading.append(element('h2', '', data.status));
      const metadata = element('div', 'metadata');
      metadata.append(field('Developer', data.developer), field('Environment', data.environment));
      panel.append(heading, element('p', 'note', 'Application status reported by Cloud Catalog. External cloud providers are not monitored.'), metadata);
      summary.textContent = `Last checked at ${new Date().toLocaleTimeString()}`;
    }
    content.replaceChildren(panel);
  } catch (error) {
    summary.textContent = 'Could not load the latest data';
    content.replaceChildren(element('p', 'error', 'Please try Refresh again. Make sure the Cloud Catalog server is running.'));
  } finally {
    content.setAttribute('aria-busy', 'false');
    refresh.disabled = false;
  }
}

refresh.addEventListener('click', load);
load();
