import time
import subprocess
import json
from pathlib import Path

OUT_FILE = Path(r"c:\Minor Project\Experiment\tier1_android_ram_log.json")

print("Starting Android RAM Monitor (10-minute run)...")
ram_log = []

# Poll every 2 seconds for 30 minutes (900 iterations)
for _ in range(900):
    try:
        result = subprocess.run(
            [r"C:\Users\hp\AppData\Local\Android\Sdk\platform-tools\adb.exe", "-s", "emulator-5554", "shell", "dumpsys meminfo com.ondeviceassistant.app"],
            capture_output=True, text=True, check=True
        )
        for line in result.stdout.split('\n'):
            if "TOTAL RSS:" in line:
                rss_kb = int(line.split()[5])
                ram_log.append(rss_kb)
    except Exception as e:
        pass
        
    time.sleep(2)

with open(OUT_FILE, "w") as f:
    json.dump({"peak_ram_kb": max(ram_log) if ram_log else 0, "log": ram_log}, f)
print("Monitoring finished.")
