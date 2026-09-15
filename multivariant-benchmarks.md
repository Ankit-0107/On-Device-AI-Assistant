# Multi-Variant Statistical Benchmarks (F16 / Q8_0 / Q4_K_M)

## Goal
Re-run the Qwen 2.5 1.5B model at three quantization levels (F16, Q8_0, Q4_K_M) with 15 iterations each, reporting mean ± σ and 95% CI for Tok/s, TTFT, load time, and peak RAM — then inject the comparison table into `Research paper.docx`.

## Tasks
- [ ] Task 1: Download/quantize F16 and Q8_0 GGUF variants of Qwen 2.5 1.5B → Verify: `models/` contains all three `.gguf` files
- [ ] Task 2: Update `tier1_pc_benchmark.py` to loop over all three variants → Verify: script prints results for F16, Q8_0, Q4_K_M
- [ ] Task 3: Run the benchmark (15 iterations × 3 variants) → Verify: `Experiment/tier1_pc_results_all.json` exists with 45 runs
- [ ] Task 4: Write `update_paper_multivariant.py` to inject a comparison Table into Section VIII → Verify: `Research paper.docx` has the new table
- [ ] Task 5: Update Discussion section (IX) to reference the new statistically controlled data instead of the old single-run numbers → Verify: paragraph text updated

## Notes
- F16 will be ~3 GB for a 1.5B model. Q8_0 ~1.6 GB. Disk space needed: ~5 GB total.
- Q4_K_M results already exist from previous run — can skip re-running if desired, but re-running ensures identical conditions.
- We use `llama-cpp-python` (CPU-only, already installed) for all variants to match the on-device (CPU) deployment target.
- The existing single-run GPU results on Gemma (Table III) remain in the paper as a separate preliminary baseline.

## Done When
- [ ] Paper Section VIII has a new comparison table with all three variants, each with mean ± σ and 95% CI
- [ ] Discussion section references the new data
