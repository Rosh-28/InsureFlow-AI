#!/usr/bin/env python3
"""
Clear Data Script for InsureFlow-AI
Clears all stored application data including claims, uploaded files, and resets to initial state.
"""

import json
import os
import shutil
from datetime import datetime
from pathlib import Path

# Color codes for terminal output
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_header(text):
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{text.center(60)}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}\n")

def print_success(text):
    print(f"{Colors.OKGREEN}✓{Colors.ENDC} {text}")

def print_warning(text):
    print(f"{Colors.WARNING}⚠{Colors.ENDC} {text}")

def print_error(text):
    print(f"{Colors.FAIL}✗{Colors.ENDC} {text}")

def print_info(text):
    print(f"{Colors.OKCYAN}ℹ{Colors.ENDC} {text}")

# Get the script's directory
SCRIPT_DIR = Path(__file__).parent
SERVER_DIR = SCRIPT_DIR / "server"
DATA_DIR = SERVER_DIR / "data"
UPLOADS_DIR = SERVER_DIR / "uploads"
BACKUP_DIR = SCRIPT_DIR / "data_backups"

# Initial data templates
INITIAL_USERS = [
    {
        "id": "user-1",
        "email": "user@example.com",
        "name": "Test User",
        "phone": "+91 98765 43210",
        "role": "user"
    },
    {
        "id": "admin-1",
        "email": "admin@insureco.com",
        "name": "Admin User",
        "role": "admin",
        "company": "InsureCo"
    }
]

INITIAL_POLICIES = [
    {
        "id": "POL-HEALTH-001",
        "policyNumber": "HLTH-2024-12345",
        "userId": "user-1",
        "type": "health",
        "holderName": "Test User",
        "coverageAmount": 500000,
        "premiumAmount": 15000,
        "startDate": "2024-01-01",
        "endDate": "2025-01-01",
        "status": "active"
    },
    {
        "id": "POL-VEHICLE-001",
        "policyNumber": "VEH-2024-67890",
        "userId": "user-1",
        "type": "vehicle",
        "holderName": "Test User",
        "coverageAmount": 1000000,
        "premiumAmount": 25000,
        "startDate": "2024-01-01",
        "endDate": "2025-01-01",
        "status": "active"
    }
]

def create_backup():
    """Create a backup of existing data before clearing"""
    print_info("Creating backup of existing data...")
    
    if not DATA_DIR.exists():
        print_warning("Data directory doesn't exist, skipping backup")
        return
    
    # Create backup directory with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = BACKUP_DIR / timestamp
    backup_path.mkdir(parents=True, exist_ok=True)
    
    # Backup JSON files
    files_backed_up = 0
    for json_file in DATA_DIR.glob("*.json"):
        if json_file.name != "dataStore.js":
            shutil.copy2(json_file, backup_path / json_file.name)
            files_backed_up += 1
    
    # Backup uploads directory
    if UPLOADS_DIR.exists():
        upload_files = [f for f in UPLOADS_DIR.iterdir() if f.name != ".gitkeep"]
        if upload_files:
            uploads_backup = backup_path / "uploads"
            uploads_backup.mkdir(exist_ok=True)
            for upload_file in upload_files:
                shutil.copy2(upload_file, uploads_backup / upload_file.name)
            files_backed_up += len(upload_files)
    
    if files_backed_up > 0:
        print_success(f"Backed up {files_backed_up} files to: {backup_path}")
    else:
        print_warning("No files to backup")
    
    return backup_path

def clear_uploads():
    """Clear all uploaded files except .gitkeep"""
    print_info("Clearing uploaded files...")
    
    if not UPLOADS_DIR.exists():
        print_warning("Uploads directory doesn't exist")
        return 0
    
    files_deleted = 0
    for file_path in UPLOADS_DIR.iterdir():
        if file_path.name != ".gitkeep" and file_path.is_file():
            try:
                file_path.unlink()
                files_deleted += 1
            except Exception as e:
                print_error(f"Error deleting {file_path.name}: {e}")
    
    if files_deleted > 0:
        print_success(f"Deleted {files_deleted} uploaded files")
    else:
        print_info("No uploaded files to delete")
    
    return files_deleted

def reset_json_file(file_path, initial_data, description):
    """Reset a JSON file to initial state"""
    print_info(f"Resetting {description}...")
    
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(initial_data, f, indent=2, ensure_ascii=False)
        print_success(f"{description} reset successfully")
        return True
    except Exception as e:
        print_error(f"Error resetting {description}: {e}")
        return False

def main():
    print_header("InsureFlow-AI Data Cleanup Tool")
    
    # Check if data directory exists
    if not DATA_DIR.exists():
        print_error(f"Data directory not found: {DATA_DIR}")
        print_info("Make sure you're running this script from the prototype directory")
        return
    
    # Confirm action
    print_warning("This will clear ALL application data including:")
    print("  • All claims")
    print("  • Uploaded documents")
    print("  • Reset users to defaults")
    print("  • Reset policies to defaults")
    print("\n  A backup will be created before clearing.")
    
    response = input(f"\n{Colors.WARNING}Continue? (yes/no): {Colors.ENDC}").strip().lower()
    
    if response not in ['yes', 'y']:
        print_info("Operation cancelled")
        return
    
    print()
    
    # Step 1: Create backup
    backup_path = create_backup()
    
    # Step 2: Clear uploads
    clear_uploads()
    
    # Step 3: Reset JSON files
    claims_file = DATA_DIR / "claims.json"
    users_file = DATA_DIR / "users.json"
    policies_file = DATA_DIR / "policies.json"
    
    reset_json_file(claims_file, [], "Claims")
    reset_json_file(users_file, INITIAL_USERS, "Users")
    reset_json_file(policies_file, INITIAL_POLICIES, "Policies")
    
    # Summary
    print_header("Cleanup Complete!")
    print_success("All data has been cleared and reset to initial state")
    
    if backup_path:
        print_info(f"Backup saved at: {backup_path}")
    
    print("\n" + Colors.OKGREEN + "You can now restart the server with clean data." + Colors.ENDC)
    print(Colors.OKCYAN + "\nDefault credentials:" + Colors.ENDC)
    print("  User:  user@example.com")
    print("  Admin: admin@insureco.com")
    print("  (No password required in current setup)\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n\n{Colors.WARNING}Operation cancelled by user{Colors.ENDC}")
    except Exception as e:
        print_error(f"Unexpected error: {e}")
        import traceback
        traceback.print_exc()
