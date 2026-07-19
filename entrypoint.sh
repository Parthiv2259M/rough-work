#!/bin/bash
set -e
# Wait for database to be ready
echo "Waiting for PostgreSQL..."
while ! nc -z db 5432; do
  sleep 1
done
echo "PostgreSQL is ready!"
# Create Odoo config
cat > /etc/odoo/odoo.conf << EOF
[options]
admin_passwd = admin
db_host = db
db_port = 5432
db_user = odoo
db_password = odoo
db_name = odoo_db
addons_path = /home/odoo/odoo/addons,/home/odoo/extra-addons
xml_rpc_port = 8069
log_level = info
workers = 2
EOF
# Run Odoo
echo "Starting Odoo..."
exec python odoo-bin -c /etc/odoo/odoo.conf "$@"