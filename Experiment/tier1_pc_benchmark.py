import llama_cpp
import time
import psutil
import os
import json
import numpy as np
from pathlib import Path

# Paths
BASE_DIR = Path(r"c:\Minor Project")
MODELS_DIR = BASE_DIR / "models"
RESULTS_PATH = BASE_DIR / "Experiment" / "tier1_pc_results_all.json"

# Models to test
MODELS = [
    "Qwen2.5-1.5B-Instruct-f16.gguf",
    "Qwen2.5-1.5B-Instruct-Q8_0.gguf",
    "qwen2.5-1.5b-instruct-q4_k_m.gguf"
]

# Benchmark Configuration
ITERATIONS = 15
MAX_TOKENS = 100
PROMPT = "<|im_start|>system\nYou are a helpful assistant.<|im_end|>\n<|im_start|>user\nWrite a short story about a brave knight exploring a dark cave.<|im_end|>\n<|im_start|>assistant\n"

def run_benchmark():
    print(f"Starting Tier 1 PC Benchmarks for Multiple Variants")
    print(f"Iterations per model: {ITERATIONS}")
    print("-" * 50)

    process = psutil.Process(os.getpid())
    all_stats = {}
    all_raw_runs = {}

    for model_name in MODELS:
        model_path = MODELS_DIR / model_name
        print(f"\nEvaluating Model: {model_name}")
        
        if not model_path.exists():
            print(f"Error: Model not found at {model_path}. Skipping.")
            continue

        results = []

        for i in range(ITERATIONS):
            print(f"  Run {i + 1}/{ITERATIONS}...", end=" ", flush=True)
            
            t0 = time.time()
            llm = llama_cpp.Llama(model_path=str(model_path), n_ctx=1024, verbose=False)
            load_time = time.time() - t0
            
            t1 = time.time()
            stream = llm.create_completion(PROMPT, max_tokens=MAX_TOKENS, stream=True)
            
            first_token_time = None
            token_count = 0
            
            for chunk in stream:
                if first_token_time is None:
                    first_token_time = time.time()
                token_count += 1
                
            t2 = time.time()
            
            ttft = first_token_time - t1 if first_token_time else 0
            gen_time = t2 - first_token_time if first_token_time else 0
            tok_sec = token_count / gen_time if gen_time > 0 else 0
            
            ram_peak = process.memory_info().rss / (1024 * 1024)
            
            results.append({
                "iteration": i + 1,
                "load_time_s": round(load_time, 4),
                "ttft_s": round(ttft, 4),
                "tok_sec": round(tok_sec, 2),
                "peak_ram_mb": round(ram_peak, 2)
            })
            
            print(f"Tok/s: {tok_sec:.2f} | TTFT: {ttft:.3f}s | RAM: {ram_peak:.1f} MB")
            
            del llm

        print(f"  Aggregating statistics for {model_name}...")
        stats = {
            "model": model_name,
            "iterations": ITERATIONS,
            "metrics": {}
        }
        
        for key in ["load_time_s", "ttft_s", "tok_sec", "peak_ram_mb"]:
            values = [r[key] for r in results]
            mean_val = np.mean(values)
            std_val = np.std(values)
            ci_95 = 1.96 * (std_val / np.sqrt(ITERATIONS))
            
            stats["metrics"][key] = {
                "mean": round(mean_val, 4),
                "std_dev": round(std_val, 4),
                "ci_95": round(ci_95, 4)
            }
        
        all_stats[model_name] = stats
        all_raw_runs[model_name] = results

    # Save to file
    final_output = {
        "summary": all_stats,
        "raw_runs": all_raw_runs
    }
    
    with open(RESULTS_PATH, 'w') as f:
        json.dump(final_output, f, indent=2)
        
    print(f"\nAll results saved to {RESULTS_PATH}")

if __name__ == "__main__":
    run_benchmark()
