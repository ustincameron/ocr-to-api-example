# Makefile

.PHONY: install run test lint format create-db reset-db

install:
	npm install

run:
	npm run dev

test:
	npm test

lint:
	npm run lint

format:
	npm run format

create-db:
	npx sequelize-cli db:create

reset-db:
	npx sequelize-cli db:drop && npx sequelize-cli db:create
