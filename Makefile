SHELL := powershell

.PHONY: help dev backend frontend up down lint test migrate seed

help:
	@Write-Host "Targets: dev backend frontend up down lint test migrate seed"

dev: up backend frontend

backend:
	@cd backend; $env:PYTHONPATH=".."; uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000

frontend:
	@cd frontend; npm run dev

up:
	@docker compose up -d postgres redis rabbitmq

down:
	@docker compose down

lint:
	@cd frontend; npm run lint

test:
	@cd backend; $env:PYTHONPATH=".."; pytest -q

migrate:
	@cd backend; $env:PYTHONPATH=".."; alembic upgrade head

seed:
	@docker exec -i synapsecrm-ai-postgres psql -U postgres -d synapsecrm_ai < database/seeds/seed.sql

