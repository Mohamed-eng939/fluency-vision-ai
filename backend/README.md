
# Pronunciation Assessment API

This is a FastAPI backend for assessing pronunciation using the Montreal Forced Aligner (MFA).

## Setup Instructions

### Prerequisites

- Python 3.8+
- [Montreal Forced Aligner](https://montreal-forced-aligner.readthedocs.io/en/latest/installation.html) installed

### Installation

1. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Download MFA models:
   ```bash
   mfa model download acoustic english_us_mfa
   mfa model download dictionary english_us_dict
   ```

4. Copy the downloaded models to the `models` directory:
   - The acoustic model should be in `models/english_us_mfa/`
   - The dictionary should be at `models/english_us_dict.dict`

### Running the API

```bash
uvicorn main:app --reload
```

The API will be available at http://localhost:8000

### Docker Deployment

You can also run the API using Docker:

```bash
docker-compose up -d
```

## API Endpoints

- `POST /analyze/`: Analyze pronunciation from audio and transcript
- `GET /check-mfa/`: Check if MFA is properly installed
