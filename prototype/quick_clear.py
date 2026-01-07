#!/usr/bin/env python3
"""
Quick Clear - No backup, no confirmation
Use this for rapid development iteration
"""

import json
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
DATA_DIR = SCRIPT_DIR / "server" / "data"
UPLOADS_DIR = SCRIPT_DIR / "server" / "uploads"

# Clear claims
(DATA_DIR / "claims.json").write_text("[]", encoding='utf-8')

# Clear uploads (keep .gitkeep)
for f in UPLOADS_DIR.iterdir():
    if f.name != ".gitkeep" and f.is_file():
        f.unlink()

# Reset users
users = [
    {"id": "user-1", "email": "user@example.com", "name": "Test User", "phone": "+91 98765 43210", "role": "user"},
    {"id": "admin-1", "email": "admin@insureco.com", "name": "Admin User", "role": "admin", "company": "InsureCo"}
]
(DATA_DIR / "users.json").write_text(json.dumps(users, indent=2), encoding='utf-8')

# Reset policies
policies = [
    {"id": "POL-HEALTH-001", "policyNumber": "HLTH-2024-12345", "userId": "user-1", "type": "health", 
     "holderName": "Test User", "coverageAmount": 500000, "premiumAmount": 15000, 
     "startDate": "2024-01-01", "endDate": "2025-01-01", "status": "active"},
    {"id": "POL-VEHICLE-001", "policyNumber": "VEH-2024-67890", "userId": "user-1", "type": "vehicle",
     "holderName": "Test User", "coverageAmount": 1000000, "premiumAmount": 25000,
     "startDate": "2024-01-01", "endDate": "2025-01-01", "status": "active"}
]
(DATA_DIR / "policies.json").write_text(json.dumps(policies, indent=2), encoding='utf-8')

print("✓ Data cleared!")
