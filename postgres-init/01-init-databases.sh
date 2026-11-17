#!/bin/sh
set -e

# PostgreSQL initialization script to create both independent databases
# Ensures the Database-per-Service architectural pattern within a single local container
echo "Creating independent microservice databases..."

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE alertas_db;
    CREATE DATABASE acompanamiento_db;
    GRANT ALL PRIVILEGES ON DATABASE alertas_db TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON DATABASE acompanamiento_db TO $POSTGRES_USER;
EOSQL

echo "Databases alertas_db and acompanamiento_db successfully created."
