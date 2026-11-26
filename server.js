const express = require('express');

const app = express();
const port = process.env.PORT || 8080;

app.disable('x-powered-by');
app.use(express.static('public'));

// Vercel serves public assets separately, so the homepage needs an explicit route.
app.get('/', (req, res) => {
  res.sendFile(require('node:path').join(__dirname, 'public', 'index.html'));
});

app.get('/api/services', (req, res) => {
  res.json([
    { serviceId: 'AWS-EC2', serviceName: 'Amazon EC2', category: 'IaaS', pricingModel: 'Pay per compute usage' },
    { serviceId: 'AWS-LAMBDA', serviceName: 'AWS Lambda', category: 'PaaS', pricingModel: 'Pay per request and execution duration' },
    { serviceId: 'AWS-S3', serviceName: 'Amazon S3', category: 'IaaS', pricingModel: 'Pay per storage and request usage' },
    { serviceId: 'GCP-RUN', serviceName: 'Google Cloud Run', category: 'PaaS', pricingModel: 'Pay per resource usage' },
    { serviceId: 'MS-365', serviceName: 'Microsoft 365', category: 'SaaS', pricingModel: 'Subscription per user' }
  ]);
});

app.get('/api/status', (req, res) => {
  res.json({ status: 'Operational', developer: 'Jason Seraphim', environment: 'Cloud PaaS' });
});

if (require.main === module) {
  const server = app.listen(port, () => {
    console.log(`Cloud Catalog running at http://localhost:${port}`);
  });
  server.on('error', (error) => {
    console.error(`Unable to start Cloud Catalog: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = app;
