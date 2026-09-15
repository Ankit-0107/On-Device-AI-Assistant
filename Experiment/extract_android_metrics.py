import subprocess
import re
import json

log_result = subprocess.run(
    [r"C:\Users\hp\AppData\Local\Android\Sdk\platform-tools\adb.exe", "-s", "emulator-5554", "logcat", "-d"],
    capture_output=True, text=True, errors="ignore"
)

ttfts = []
toks = []

for line in log_result.stdout.split('\n'):
    if "RNLLAMA_LOG_ANDROID: common_perf_print: prompt eval time" in line:
        # e.g., prompt eval time =   10037.28 ms /    87 tokens (  115.37 ms per token,     8.67 tokens per second)
        match = re.search(r"prompt eval time =\s+([\d\.]+)\s*ms", line)
        if match:
            ttfts.append(float(match.group(1)) / 1000.0)
    if "RNLLAMA_LOG_ANDROID: common_perf_print:        eval time" in line:
        # e.g., eval time =   15022.01 ms /    96 runs   (  156.48 ms per token,     6.39 tokens per second)
        match = re.search(r"([\d\.]+)\s*tokens per second", line)
        if match:
            toks.append(float(match.group(1)))

avg_ttft = sum(ttfts)/len(ttfts) if ttfts else 0.0
avg_toks = sum(toks)/len(toks) if toks else 0.0

out_data = {
    "count": len(toks),
    "avg_ttft_sec": round(avg_ttft, 3),
    "avg_tok_sec": round(avg_toks, 2),
    "ttft_list": ttfts,
    "toks_list": toks
}

with open(r"c:\Minor Project\Experiment\tier1_android_metrics.json", "w") as f:
    json.dump(out_data, f, indent=4)

print(f"Extracted {len(toks)} prompts.")
print(f"Average TTFT: {avg_ttft:.3f} s")
print(f"Average Tok/s: {avg_toks:.2f}")
