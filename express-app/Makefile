.PHONY: build run test install

build:
	docker build -t express-app .

run:
	docker run -p 3000:3000 express-app

test:
	# Run JavaScript tests using npm test (assuming test script is defined in package.json)
	npm test

install:
	# Install Node.js dependencies
	npm install

# Optional: Add lint and format targets if used in the project
# lint:
#	npm run lint # Assuming lint script in package.json
# format:
#	npm run format # Assuming format script in package.json

# Optional: Add database management targets using Sequelize CLI or a script
# create-db:
#	npx sequelize-cli db:create # Example using Sequelize CLI
# reset-db:
#	npx sequelize-cli db:drop && npx sequelize-cli db:create # Example using Sequelize CLI
