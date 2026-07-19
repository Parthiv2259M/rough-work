FROM python:3.9-slim-buster

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    postgresql-client \
    libpq-dev \
    python3-pip \
    wkhtmltopdf \
    libfreetype6-dev \
    zlib1g-dev \
    libjpeg-dev \
    libharfbuzz0b \
    libwebp6 \
    && rm -rf /var/lib/apt/lists/*

# Create odoo user
RUN useradd -m -d /home/odoo -s /bin/bash odoo

# Set working directory
WORKDIR /home/odoo

# Clone Odoo (14.0)
RUN git clone https://github.com/odoo/odoo.git --depth 1 --branch 14.0
WORKDIR /home/odoo/odoo

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install psycopg2-binary

# Copy custom addons
RUN mkdir -p /home/odoo/extra-addons
COPY odoo-xml-editor /home/odoo/extra-addons/odoo-xml-editor

# Copy startup script
COPY ./entrypoint.sh /
RUN chmod +x /entrypoint.sh

# Change ownership
RUN chown -R odoo:odoo /home/odoo

# Expose port
EXPOSE 8069

# Run as odoo user
USER odoo

# Entrypoint
ENTRYPOINT ["/entrypoint.sh"]
