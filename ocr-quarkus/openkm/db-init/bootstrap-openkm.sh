#!/bin/bash
set -eu
if set -o | grep -q pipefail; then
  set -o pipefail
fi

DB_DSN="OKM/okm@//openkm-db:1521/XEPDB1"

while ! echo "select 1 from okm_user;" | sqlplus -S "${DB_DSN}" >/dev/null 2>&1; do
  echo "Waiting for OpenKM schema..."
  sleep 10
done

sqlplus -S "${DB_DSN}" @/scripts/bootstrap-openkm.sql
