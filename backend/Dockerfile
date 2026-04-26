FROM python:3.10-slim

WORKDIR /app

# Install system dependencies if required
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend files
COPY . .

# Run training to generate models locally inside the container
RUN python train.py
RUN python generate_causal_dag.py

# Expose port (Cloud Run sets the PORT env variable, defaulting to 8080)
ENV PORT=8080
EXPOSE $PORT

# Start the application
CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT
