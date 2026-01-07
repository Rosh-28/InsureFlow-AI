# Data Management Scripts

Scripts to manage and clear application data for development and testing.

## Scripts Overview

### 1. `clear_data.py` - Safe Clear with Backup
**Recommended for production/important data**

Features:
- ✅ Creates timestamped backup before clearing
- ✅ Confirms before proceeding
- ✅ Detailed logging with colors
- ✅ Clears all claims
- ✅ Removes uploaded documents
- ✅ Resets users and policies to defaults
- ✅ Backup stored in `data_backups/` folder

**Usage:**
```bash
# From prototype directory
python clear_data.py

# Or use Python 3 explicitly
python3 clear_data.py
```

**What it backs up:**
- All JSON files (claims.json, users.json, policies.json)
- All uploaded documents
- Saves to: `data_backups/YYYYMMDD_HHMMSS/`

---

### 2. `quick_clear.py` - Fast Clear (No Backup)
**Use during rapid development/testing**

Features:
- ⚡ Super fast - no confirmations
- ⚡ No backup created
- ⚡ Clears everything instantly
- ⚠️  **WARNING:** Cannot undo!

**Usage:**
```bash
python quick_clear.py
```

---

## What Gets Cleared

Both scripts will:
1. **Delete all claims** - `server/data/claims.json` → `[]`
2. **Remove uploaded files** - All files in `server/uploads/` (except .gitkeep)
3. **Reset users** to default test users
4. **Reset policies** to default test policies

## Default Data After Clear

### Users
- **User Account**: `user@example.com` (role: user)
- **Admin Account**: `admin@insureco.com` (role: admin)

### Policies
- Health Policy: `HLTH-2024-12345` (₹5,00,000 coverage)
- Vehicle Policy: `VEH-2024-67890` (₹10,00,000 coverage)

### Claims
- Empty - no claims

---

## Usage Scenarios

### Scenario 1: Testing New Features
```bash
# Quick iteration - no backup needed
python quick_clear.py
```

### Scenario 2: Preparing Demo
```bash
# Clear data but keep backup
python clear_data.py
# Type 'yes' to confirm
```

### Scenario 3: Restore from Backup
Backups are in `data_backups/YYYYMMDD_HHMMSS/`

To restore:
```bash
# Copy backup files back to data directory
cp data_backups/20260107_143022/claims.json server/data/
cp data_backups/20260107_143022/users.json server/data/
cp data_backups/20260107_143022/policies.json server/data/
cp -r data_backups/20260107_143022/uploads/* server/uploads/
```

---

## Requirements

- Python 3.6+
- No additional packages required (uses only standard library)

---

## Tips

1. **Before clearing**: Stop the server (`Ctrl+C` in the node terminal)
2. **After clearing**: Restart the server to load fresh data
3. **Check backups**: Look in `data_backups/` folder for saved data
4. **Keep .gitkeep**: The `.gitkeep` file in uploads/ is never deleted

---

## Troubleshooting

### "Data directory not found"
Make sure you run the scripts from the `prototype` directory:
```bash
cd prototype
python clear_data.py
```

### "Permission denied"
Make sure the server is stopped before clearing data.

### Want to keep some data?
Edit the scripts to customize what gets cleared. Both scripts are simple Python code.

---

## Advanced: Custom Clear

Create your own custom clearing script:

```python
import json
from pathlib import Path

DATA_DIR = Path("server/data")

# Only clear claims, keep everything else
(DATA_DIR / "claims.json").write_text("[]")
print("Claims cleared!")
```

---

## Safety

- `clear_data.py` always creates a backup first
- `quick_clear.py` has NO backup - be careful!
- Backups are never auto-deleted
- You can manually delete old backups from `data_backups/`
