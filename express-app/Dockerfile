# Use a more recent Node.js LTS version
FROM node:20-slim

# Install system dependencies for OCR and PDF processing
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libtesseract-dev \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Ensure the uploads directory exists
RUN mkdir -p uploads

EXPOSE 3000

CMD [ "node", "server.js" ]
