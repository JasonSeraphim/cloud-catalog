# Enterprise Cloud Service Catalog

A Node.js and Express project by **Jason Seraphim**, roll number **2648029**.

## Run locally

Uses Node.js 22.x and npm. Open a terminal in this `cloud-catalog` directory:

```sh
npm ci
npm start
```

Open [http://localhost:8080](http://localhost:8080). Stop the server with Ctrl+C.
If port 8080 is already occupied, stop the other application or choose a different port:

```sh
PORT=9090 npm start
```

The landing page uses responsive styling, displays the developer identity, and has two button-style links to the service and status display pages. It requires no frontend build step or external assets.

## Display pages

The landing page buttons open `/services.html` and `/status.html`, which display live API data in matching dark layouts. Both pages support Refresh, loading and error messages, and a View JSON link. The `/api/services` and `/api/status` endpoints continue to return JSON for the assignment.

## Routes

| Method | Path | Response |
| --- | --- | --- |
| GET | `/` | Styled catalog landing page |
| GET | `/services.html` | Styled service catalog |
| GET | `/status.html` | Styled application status |
| GET | `/api/services` | Array of five cloud services |
| GET | `/api/status` | Operational status, developer, and environment |

Services include Amazon EC2, AWS Lambda, Amazon S3, Google Cloud Run, and Microsoft 365. Every entry includes `serviceId`, `serviceName`, `category` (IaaS, PaaS, or SaaS), and `pricingModel`. Pricing descriptions are illustrative billing models, not price quotes. The status endpoint reports application metadata; it does not probe external cloud providers. Its required `Cloud PaaS` label is returned during local execution too.

Example status response:

```json
{
  "status": "Operational",
  "developer": "Jason Seraphim",
  "environment": "Cloud PaaS"
}
```

## Port explanation (100 words)

The server chooses its listening port with process.env.PORT || 8080. When PORT is defined, Node.js uses that environment value, allowing hosting platforms to select the port required by their infrastructure. When PORT is absent, the application falls back to 8080, giving local development a predictable address: http://localhost:8080. This avoids hardcoding a port that could conflict with a platform's routing configuration. Locally, npm start launches server.js and serves both the landing page and JSON endpoints through this port. Vercel manages incoming requests through its Express integration; the port fallback supports local execution, while the exported application supports its managed function runtime.

## Verification

```sh
npm test
```

Tests start an isolated local HTTP server on an available port and verify the landing page, identity, both links, JSON content types, service fields, allowed categories, unique IDs, exact status metadata, and unknown-route handling.

To check the running server on the assignment's default port:

```sh
curl -i http://localhost:8080/
curl -i http://localhost:8080/api/services
curl -i http://localhost:8080/api/status
```

## Project files

```text
cloud-catalog/
├── .gitignore
├── .vercelignore
├── package.json
├── package-lock.json
├── README.md
├── server.js
├── public/
│   ├── index.html
│   ├── services.html
│   ├── status.html
│   ├── details.css
│   └── details.js
└── test/
    └── catalog.test.js
```

`npm start` runs `server.js`. Express serves `public/index.html` with `express.static('public')`, so run the app from the project directory. The application is also exported for a managed Express runtime.

## Deployment

Live site: [cloud-catalog-one.vercel.app](https://cloud-catalog-one.vercel.app). Vercel project: `christ-university3/cloud-catalog`.

Source repository: [JasonSeraphim/cloud-catalog](https://github.com/JasonSeraphim/cloud-catalog). The production branch is `main`. Vercel is connected to this repository and automatically deploys pushes to `main`.

Deploy this directory as an Express project on Vercel. `server.js` exports the application, `public/` contains the static pages, and Node.js 22.x is specified in `package.json`. No database or environment secrets are required.

Vercel serves the static files through its CDN and runs the JSON routes as an Express function. The homepage has an explicit Express handler because the hosted runtime does not use `express.static`. Local execution continues to use port 8080 unless `PORT` is set. Keep `package-lock.json` with the source for reproducible installs. Ignore files exclude dependencies, local environment files, and Vercel account metadata from publication.

## Publish updates through Git

From this project directory, make your changes, run the checks, commit, and push:

```sh
npm test
git add public server.js README.md package.json package-lock.json test vercel.json
git commit -m "Describe your changes"
git push origin main
```

Vercel builds the pushed commit and updates the existing production URL. Dependencies, environment files, and local Vercel settings remain ignored.

For a manual deployment from a signed-in Vercel CLI session:

```sh
npx vercel --prod
```

Verify `/`, `/services.html`, `/status.html`, `/api/services`, and `/api/status` on the resulting public URL. If a deployment fails these checks, restore the last working deployment from the Vercel dashboard.

## References

- [Express static files](https://expressjs.com/en/starter/static-files/)
- [Express on Vercel](https://vercel.com/docs/frameworks/backend/express)
