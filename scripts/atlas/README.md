# Auto-add your IP to MongoDB Atlas at logon

This lets MongoDB Atlas always accept connections from your PC, even though your
home/ISP IP changes. A Scheduled Task detects your current public IP at every logon
and adds it to the Atlas project IP access list via the Atlas Admin API.

## One-time setup

### 1. Create an Atlas API key
1. https://cloud.mongodb.com → open your **Project**
2. **Access Manager → API Keys → Create API Key**
3. Give it a **Project Owner** role (or any role with *Project IP Access List* permission)
4. Copy the **Public Key** and **Private Key** (private key is shown only once)

### 2. Get your Project ID
- In Atlas, open the project → **Project Settings** → copy the **Project ID**
  (24-character hex), or read it from the project URL.

### 3. Fill in the config
Copy `atlas.config.example.json` to `atlas.config.json` and fill it in:

```json
{
  "projectId": "6789abcd...",
  "publicKey": "ABCDEFGH",
  "privateKey": "your-private-key",
  "comment": "auto-added at logon"
}
```

> `atlas.config.json` contains a secret and is git-ignored — never commit it.

### 4. Test it once
```powershell
powershell -ExecutionPolicy Bypass -File .\update-atlas-ip.ps1
```
You should see `Added <ip> to the Atlas allowlist.`

### 5. Make it run at logon — pick ONE

**Option A — Startup folder (no admin required, recommended)**
```powershell
powershell -ExecutionPolicy Bypass -File .\install-startup.ps1
```
Creates a shortcut in your user Startup folder. To remove it, delete
`%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\Atlas Update IP.lnk`.

**Option B — Scheduled Task (requires an Administrator PowerShell)**
```powershell
powershell -ExecutionPolicy Bypass -File .\register-startup-task.ps1
```

That's it. It now runs automatically every time you log in.

## Useful commands
```powershell
Start-ScheduledTask -TaskName "Atlas-Update-My-IP"          # run now
Get-ScheduledTaskInfo -TaskName "Atlas-Update-My-IP"        # last run result
Unregister-ScheduledTask -TaskName "Atlas-Update-My-IP" -Confirm:$false  # remove
```

## Note about Render
Render's free tier has dynamic outbound IPs and cannot be auto-added. To let the
deployed backend reach Atlas you must allow `0.0.0.0/0` (all IPs) in Atlas, use
Render's static outbound IPs (paid), or run the API through a proxy with a fixed IP.
If you do allow `0.0.0.0/0`, your own PC is covered too and this script becomes
optional — it is mainly useful when you want the allowlist kept as tight as possible.
