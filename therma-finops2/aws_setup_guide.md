# AWS Academy Learner Lab — Step-by-Step Setup Guide

## Part 1: Start the Lab & Launch EC2

### Step 1 — Start your Lab Session
1. Go to [AWS Academy](https://awsacademy.instructure.com/login/canvas)
2. Open your **Learner Lab** course
3. Click **"Start Lab"** (top right) — wait for the 🔴 dot to turn 🟢
4. Click **"AWS"** (the green dot) to open the AWS Console

### Step 2 — Launch an EC2 Instance
1. In the AWS Console, search for **EC2** in the top search bar → click it
2. Click **"Launch Instance"**
3. Fill in:
   - **Name**: `therma-finops-worker`
   - **AMI**: Amazon Linux 2023 (should be pre-selected)
   - **Instance type**: `t2.micro` (free tier)
   - **Key pair**: Select **`vockey`** (this is the lab's default key)
   - **Network settings**: Click **Edit** →
     - Check ✅ **Allow SSH traffic from** → `Anywhere (0.0.0.0/0)`
4. Click **"Launch Instance"**
5. Wait ~30 seconds, then click **"View all instances"**
6. Wait for **Instance State** to show **"Running"** ✅

### Step 3 — Copy the Public IP
1. Click on your instance name (`therma-finops-worker`)
2. Find **Public IPv4 address** (e.g., `3.85.142.67`)
3. **Copy this IP** — you'll need it for `.env`

---

## Part 2: Download the SSH Key

### Step 4 — Get the PEM key
1. Go back to the **Learner Lab** page (the Canvas tab)
2. Click **"AWS Details"** (top right, next to "Start Lab")
3. Click **"Download PEM"** — this downloads `labsuser.pem`
4. Move/copy `labsuser.pem` to your project folder:
   ```
   C:\SEM6\RMS\therma-finops2\labsuser.pem
   ```
   *(If the file already exists there, replace it with the new one — keys change each lab session)*

---

## Part 3: Set Up Docker on EC2

### Step 5 — SSH into EC2
Open **Command Prompt** or **PowerShell** and run:
```bash
ssh -i "C:\SEM6\RMS\therma-finops2\labsuser.pem" ec2-user@YOUR_EC2_IP
```
Replace `YOUR_EC2_IP` with the IP you copied in Step 3.

> If you get a "permissions too open" error, run this first:
> ```powershell
> icacls "C:\SEM6\RMS\therma-finops2\labsuser.pem" /inheritance:r /grant:r "%USERNAME%:R"
> ```

Type `yes` when asked about the fingerprint.

### Step 6 — Run the setup script on EC2
Once you're SSH'd in, paste this **entire block** and press Enter:

```bash
#!/bin/bash
echo "Starting Therma-FinOps EC2 Setup..."

# Install Docker
sudo yum update -y
sudo yum install docker -y
sudo service docker start
sudo usermod -a -G docker ec2-user

# Create working directories
mkdir -p ~/therma-worker/logs
chmod 777 ~/therma-worker/logs
cd ~/therma-worker

# Create the Python worker script
cat << 'EOF' > run_worker.py
import os
import time
import math
from datetime import datetime, timedelta, timezone

task_id = os.getenv("TASK_ID", "unknown")
print(f"Cloud container executing Task: {task_id}")

end_time = time.time() + 5
while time.time() < end_time:
    math.factorial(10000)

print(f"Task {task_id} completed successfully in cloud.")

ist_timezone = timezone(timedelta(hours=5, minutes=30))
current_time = datetime.now(ist_timezone).strftime('%Y-%m-%d %H:%M:%S')

log_entry = f"[{current_time}] SUCCESS: {task_id} executed on AWS Cloud Node.\n"
with open('/app/logs/finops_audit.log', 'a') as f:
    f.write(log_entry)
EOF

# Create the Dockerfile
cat << 'EOF' > Dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY run_worker.py .
RUN mkdir -p /app/logs
CMD ["python", "run_worker.py"]
EOF

# Build the Docker image
sudo docker build -t therma-finops-worker:latest .

echo "=========================================="
echo "✅ Setup Complete! Worker is ready."
echo "=========================================="
```

Wait for it to finish (~1–2 minutes). You should see **"✅ Setup Complete!"**.

### Step 7 — Verify Docker is working
Still on EC2, run:
```bash
sudo docker run --rm -e TASK_ID=test_task therma-finops-worker:latest python run_worker.py
```
You should see:
```
Cloud container executing Task: test_task
Task test_task completed successfully in cloud.
```

Type `exit` to leave the SSH session.

---

## Part 4: Update Your Local Config & Run

### Step 8 — Update `.env` with the new EC2 IP
Open `C:\SEM6\RMS\therma-finops2\.env` and update line 2:
```
AWS_EC2_IP=YOUR_EC2_IP
```
Replace `YOUR_EC2_IP` with the actual IP from Step 3.

### Step 9 — Run Therma-FinOps!
```bash
cd C:\SEM6\RMS\therma-finops2
python main.py
```

You should see tasks offloading to EC2:
```
Starting Therma-FinOps Workload Engine...
[Config] Trigger mode: URI
Current CPU Temp: 45.05°C
  URI=0.1100 [...] 
  ⚠ URI THRESHOLD (0.10) BREACHED — triggering offload!
Evaluating offload for 10 tasks...
Decision: Offloading to AWS EC2...
Spinning up Docker container on EC2 for Task task_batch_1...
Cloud Task task_batch_1 completed successfully.
...
```

### Step 10 — Verify cloud logs (optional)
SSH back into EC2 and check the audit log:
```bash
ssh -i "C:\SEM6\RMS\therma-finops2\labsuser.pem" ec2-user@YOUR_EC2_IP
cat ~/therma-worker/logs/finops_audit.log
```

---

## Quick Troubleshooting

| Problem | Fix |
|---------|-----|
| `Connection refused` / `timeout` | EC2 Security Group doesn't allow SSH — check Step 2 network settings |
| `Permission denied (publickey)` | Wrong key file — re-download PEM (Step 4) |
| `permissions too open` | Run the `icacls` command from Step 5 |
| `Docker: command not found` | Re-run Step 6 setup script |
| Lab 🔴 (stopped) | Your session expired — click "Start Lab" again, get new IP & key |

> ⚠️ **Important**: Every time you restart the lab, the **EC2 IP changes** and the **PEM key may change**. Always re-download the key and update `.env` with the new IP.
