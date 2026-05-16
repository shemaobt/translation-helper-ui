#!/bin/sh
set -e

# Source secrets from the GCP Secret Manager sidecar volume if present.
# The sidecar writes BACKEND_URL='...' there before this container boots.
if [ -f /run/secrets/.env ]; then
  set -a
  . /run/secrets/.env
  set +a
fi

# Substitute environment variables in the nginx config template.
envsubst '$BACKEND_URL' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# Start nginx in the foreground.
exec nginx -g 'daemon off;'
