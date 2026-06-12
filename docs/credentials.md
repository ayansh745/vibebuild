Service account credentials

Do NOT commit service account keys to git.

Place your Google Cloud service account JSON key in the repository root `credentials` folder as `service-account.json` (the folder is gitignored):

  credentials/service-account.json

Then run the helper script to start the server with the service account:

  ./scripts/start-with-service-account.sh

Permissions: ensure this file is readable only by you:

  chmod 600 credentials/service-account.json
