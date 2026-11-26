const assert = require('node:assert/strict');
const { test, before, after } = require('node:test');
const { once } = require('node:events');
const app = require('../server');

let server;
let base;
before(async () => {
  server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));

test('landing page contains identity and both endpoint links', async () => {
  const response = await fetch(base);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /text\/html/);
  const html = await response.text();
  for (const text of ['Enterprise Cloud Service Catalog', 'Jason Seraphim', '2648029', 'href="/api/services"', 'href="/api/status"', 'href="/services.html"', 'href="/status.html"']) {
    assert.ok(html.includes(text), `Missing ${text}`);
  }
});

test('services returns at least four complete, uniquely identified catalog entries', async () => {
  const response = await fetch(`${base}/api/services`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /application\/json/);
  const services = await response.json();
  assert.ok(Array.isArray(services) && services.length >= 4);
  assert.equal(new Set(services.map((service) => service.serviceId)).size, services.length);
  for (const service of services) {
    assert.deepEqual(Object.keys(service).sort(), ['category', 'pricingModel', 'serviceId', 'serviceName']);
    for (const value of Object.values(service)) assert.ok(typeof value === 'string' && value.trim());
    assert.ok(['IaaS', 'PaaS', 'SaaS'].includes(service.category));
  }
});

test('status returns the required health metadata', async () => {
  const response = await fetch(`${base}/api/status`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /application\/json/);
  assert.deepEqual(await response.json(), {
    status: 'Operational', developer: 'Jason Seraphim', environment: 'Cloud PaaS'
  });
});

test('unknown routes return 404', async () => {
  assert.equal((await fetch(`${base}/api/missing`)).status, 404);
});


test('display pages and their shared assets are served', async () => {
  for (const page of ['services', 'status']) {
    const response = await fetch(`${base}/${page}.html`);
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type'), /text\/html/);
    const html = await response.text();
    assert.ok(html.includes(`data-page="${page}"`));
    assert.ok(html.includes(`href="/api/${page}"`));
    assert.ok(html.includes('src="/details.js"'));
    assert.ok(html.includes('href="/details.css"'));
  }
  for (const asset of ['details.js', 'details.css']) {
    assert.equal((await fetch(`${base}/${asset}`)).status, 200);
  }
});

test('homepage fallback works when the public middleware cannot resolve its directory', async () => {
  const originalDirectory = process.cwd();
  try {
    process.chdir(require('node:os').tmpdir());
    const response = await fetch(base);
    assert.equal(response.status, 200);
    assert.ok((await response.text()).includes('Enterprise Cloud Service Catalog'));
  } finally {
    process.chdir(originalDirectory);
  }
});
