# Makefile

.PHONY: install run test lint format

install:
	python3 -m venv venv && source venv/bin/activate && pip install --upgrade pip && pip install -r requirements.txt

run:
	. venv/bin/activate && uvicorn app.main:app --reload

test:
	. venv/bin/activate && pytest tests/

lint:
	venv/bin/ruff check .

format:
	venv/bin/ruff format .

create-db:
	set -a && source .env && set +a && \
	psql -h $$(echo $$DATABASE_URL | sed -E 's|.*@([^:/]+).*|\1|') \
	     -p $$(echo $$DATABASE_URL | sed -E 's|.*:([0-9]+)/.*|\1|') \
	     -U $$(echo $$DATABASE_URL | sed -E 's|.*//([^:]+):.*|\1|') \
	     -c "CREATE DATABASE $$(echo $$DATABASE_URL | sed -E 's|.*/([^?]+).*|\1|');" || true

reset-db:
	set -a && source .env && set +a && \
	db=$$(echo $$DATABASE_URL | sed -E 's|.*/([^?]+).*|\1|') && \
	host=$$(echo $$DATABASE_URL | sed -E 's|.*@([^:/]+).*|\1|') && \
	port=$$(echo $$DATABASE_URL | sed -E 's|.*:([0-9]+)/.*|\1|') && \
	user=$$(echo $$DATABASE_URL | sed -E 's|.*//([^:]+):.*|\1|') && \
	psql -h $$host -p $$port -U $$user -c "DROP DATABASE IF EXISTS $$db;" && \
	psql -h $$host -p $$port -U $$user -c "CREATE DATABASE $$db;"
