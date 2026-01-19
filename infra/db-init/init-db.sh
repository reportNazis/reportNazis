#!/bin/bash
# Dynamic Multi-Database Initialization Script
# Creates multiple databases with isolated users from POSTGRES_MULTIPLE_DATABASES env var
# Format: "dbname:user:password,dbname2:user2:password2"

set -e

if [ -z "$POSTGRES_MULTIPLE_DATABASES" ]; then
    echo "[init-db] No additional databases to create (POSTGRES_MULTIPLE_DATABASES not set)"
    exit 0
fi

echo "[init-db] Starting multi-database initialization..."

IFS=',' read -ra DB_ENTRIES <<< "$POSTGRES_MULTIPLE_DATABASES"

for entry in "${DB_ENTRIES[@]}"; do
    # Trim whitespace
    entry=$(echo "$entry" | xargs)
    
    if [ -z "$entry" ]; then
        continue
    fi
    
    IFS=':' read -r db user pass <<< "$entry"
    
    if [ -z "$db" ] || [ -z "$user" ] || [ -z "$pass" ]; then
        echo "[init-db] Skipping invalid entry: $entry"
        continue
    fi
    
    echo "[init-db] Creating database: $db with user: $user"
    
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres <<-EOSQL
        -- Create role if not exists
        DO \$\$
        BEGIN
            IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$user') THEN
                CREATE ROLE "$user" WITH LOGIN PASSWORD '$pass';
                RAISE NOTICE 'Created role: $user';
            ELSE
                RAISE NOTICE 'Role already exists: $user';
            END IF;
        END
        \$\$;

        -- Create database if not exists
        SELECT 'CREATE DATABASE "$db" OWNER "$user"'
        WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$db')\gexec

        -- Grant privileges
        GRANT ALL PRIVILEGES ON DATABASE "$db" TO "$user";
EOSQL

    # Grant schema privileges after DB is created
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$db" <<-EOSQL
        GRANT ALL ON SCHEMA public TO "$user";
        ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "$user";
        ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO "$user";
EOSQL

    echo "[init-db] Successfully configured database: $db"
done

echo "[init-db] Multi-database initialization complete!"
