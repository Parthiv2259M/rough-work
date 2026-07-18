# Odoo XML Editor - Installation & Setup Guide

## Overview
This branch contains the **Odoo XML Editor** module alongside Odoo installation instructions. Both the module and Odoo instance are kept in the same branch for easy deployment.

## Directory Structure
```
Branch_odoo/
├── odoo-xml-editor/          # Odoo module (XML Editor)
│   ├── __init__.py
│   ├── __manifest__.py       # Module metadata
│   ├── controllers/          # Controllers
│   ├── models/               # Database models
│   ├── views/                # XML views & menus
│   ├── security/             # Access control rules
│   └── static/               # Static files
├── odoo/                     # Odoo instance (created during setup)
├── docker-compose.yml        # Docker compose file
├── Dockerfile                # Custom Dockerfile
├── requirements.txt          # Python dependencies
└── ODOO_SETUP.md            # This file
```

## System Requirements
- Docker & Docker Compose
- 2GB+ RAM
- 10GB+ Disk space
- Port 8069 available (Odoo web)
- Port 5432 available (PostgreSQL)

## Quick Start (Docker)

### 1. Install Docker & Docker Compose
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install docker.io docker-compose

# macOS
brew install docker docker-compose
```

### 2. Clone & Navigate
```bash
git clone https://github.com/Parthiv2259M/rough-work.git
cd rough-work
git checkout Branch_odoo
```

### 3. Start Odoo with Docker
```bash
# Build and start containers
docker-compose up -d

# Check status
docker-compose ps
```

### 4. Access Odoo
- **URL**: http://localhost:8069
- **Default Credentials**: admin / admin
- **Database**: odoo_db

## Manual Installation (Linux)

### 1. System Dependencies
```bash
sudo apt-get update
sudo apt-get install -y \
    python3 python3-pip python3-dev \
    postgresql postgresql-contrib \
    git wget wkhtmltopdf libpq-dev \
    libjpeg-dev zlib1g-dev libfreetype6-dev \
    liblcms2-dev libtiff5-dev tcl8.6-dev tk8.6-dev \
    libharfbuzz0b libwebp6 libopenjp2-7
```

### 2. Create PostgreSQL Database
```bash
sudo -u postgres createuser odoo
sudo -u postgres createdb odoo_db -O odoo
```

### 3. Install Odoo
```bash
# Clone official Odoo repository
git clone https://github.com/odoo/odoo.git --depth 1 --branch 14.0
cd odoo

# Install Python dependencies
pip3 install -r requirements.txt
```

### 4. Configure Odoo
```bash
# Create config file
sudo mkdir -p /etc/odoo
sudo touch /etc/odoo/odoo.conf
```

Edit `/etc/odoo/odoo.conf`:
```ini
[options]
admin_passwd = admin
db_host = localhost
db_port = 5432
db_user = odoo
db_password = odoo
db_name = odoo_db
addons_path = /path/to/odoo/addons,/path/to/rough-work/odoo-xml-editor
xml_rpc_port = 8069
log_level = info
```

### 5. Run Odoo
```bash
python3 odoo-bin -c /etc/odoo/odoo.conf
```

## Installing the XML Editor Module

### Method 1: Via Odoo Web Interface
1. Go to Apps menu (after logging in as admin)
2. Click "Update Apps List" (top right)
3. Search for "Odoo XML Editor"
4. Click "Install"

### Method 2: Via Command Line
```bash
# Stop Odoo first
Ctrl + C

# Run with module installation
python3 odoo-bin -c /etc/odoo/odoo.conf -i odoo_xml_editor -d odoo_db
```

### Method 3: Via Docker
```bash
# Add module path in docker-compose.yml addons_path
# Restart containers
docker-compose down
docker-compose up -d
```

## Module Features

✅ **Visual XML Editing** - Edit XML structure of all web pages
✅ **Drag & Drop** - Reorder XML elements easily
✅ **Add/Remove Elements** - Create and delete elements
✅ **Live Preview** - See changes in real-time
✅ **Import/Export** - Backup and restore XML configurations
✅ **All View Types** - Support for form, kanban, tree, search views
✅ **Database Persistence** - Changes saved automatically
✅ **Version Control** - Track and rollback changes
✅ **Syntax Highlighting** - Code highlight for XML
✅ **Validation** - Element validation on save

## Module Information
- **Name**: Odoo XML Editor
- **Version**: 1.0.0
- **Category**: Tools
- **Author**: Parthiv2259M
- **License**: LGPL-3
- **Dependencies**: base, web
- **Requires**: Odoo 14.0+

## Troubleshooting

### Port Already in Use
```bash
# Change port in config
# Find process using port 8069
lsof -i :8069
# Kill process
kill -9 <PID>
```

### Database Connection Error
```bash
# Verify PostgreSQL is running
sudo systemctl status postgresql

# Check credentials in config file
# Verify database exists
sudo -u postgres psql -l
```

### Module Not Loading
```bash
# Clear cache
rm -rf ~/.local/share/Odoo/

# Restart Odoo with --init parameter
python3 odoo-bin -c /etc/odoo/odoo.conf -i odoo_xml_editor -d odoo_db --stop-after-init
```

## Security Permissions
The module includes two security groups:
- **XML Editor User**: Read-only access
- **XML Editor Manager**: Full access (read, write, create, delete)

## File Paths
- **Module Path**: `/path/to/rough-work/odoo-xml-editor/`
- **Config File**: `/etc/odoo/odoo.conf`
- **Logs**: Check Odoo console or `/var/log/odoo/`
- **Database**: PostgreSQL `odoo_db`

## API Endpoints
- Odoo Web: `http://localhost:8069`
- XML-RPC API: `http://localhost:8069/xmlrpc/2`
- JSON-RPC API: `http://localhost:8069/jsonrpc`

## Useful Commands

```bash
# View Odoo logs
grep -E 'WARNING|ERROR' /var/log/odoo/odoo.log

# Restart Odoo
sudo systemctl restart odoo

# Check installed modules
psql -U odoo -d odoo_db -c "SELECT name FROM ir_module_module WHERE state='installed';"

# Backup database
sudo -u postgres pg_dump odoo_db > odoo_backup.sql

# Restore database
sudo -u postgres psql odoo_db < odoo_backup.sql
```

## Next Steps
1. Configure your Odoo instance settings
2. Install required modules based on your needs
3. Import sample data if needed
4. Test the XML Editor module
5. Create custom views using the editor

## Support
For issues or questions:
- Check Odoo logs
- Review module documentation
- Visit: https://github.com/Parthiv2259M/odoo-xml-editor

## License
LGPL-3 License - See module for details
