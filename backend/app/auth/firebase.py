from __future__ import annotations

import os

import firebase_admin
from firebase_admin import credentials

from backend.app.core.config import settings

def init_firebase() -> None:
    if firebase_admin._apps:
        return

    # Attempt to load from env settings first
    if settings.firebase_project_id and settings.firebase_client_email and settings.firebase_private_key:
        cert_dict = {
            "type": "service_account",
            "project_id": settings.firebase_project_id,
            "private_key_id": "",
            "private_key": settings.firebase_private_key.replace("\\n", "\n"),
            "client_email": settings.firebase_client_email,
            "client_id": "",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": f"https://www.googleapis.com/robot/v1/metadata/x509/{settings.firebase_client_email.replace('@', '%40')}",
        }
        cred = credentials.Certificate(cert_dict)
        firebase_admin.initialize_app(cred)
    else:
        # Check for service account file
        service_account_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "firebase_service_account.json")
        if os.path.exists(service_account_path):
            cred = credentials.Certificate(service_account_path)
            firebase_admin.initialize_app(cred)
            print(f"Firebase initialized using {service_account_path}")
        else:
            # Fallback to Application Default Credentials if running in cloud, or explicit JSON file path
            # Assuming explicit environment variable for Google credentials if individual variables aren't set
            if not os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
                print("Warning: Firebase initialized without explicit credentials or GOOGLE_APPLICATION_CREDENTIALS")
            firebase_admin.initialize_app()

