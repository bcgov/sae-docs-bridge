#!/bin/sh

cat > /usr/src/app/config/production.json <<EOF
{
  "host": "${HELP_API_HOST}",
  "port": 8000,
  "token": "${HELP_API_TOKEN}",
  "applications": [${HELP_APPS}],
  "documentTypes": [${HELP_DOCUMENT_TYPES}],
  "logLevel": "prod",
  "morganFormat": "combined",
  "whitelist": [${CORS_WHITELIST}]
}
EOF

npm run start:prod
