import json
import numpy as np
from docx import Document
from docx.shared import Pt, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH

with open(r"c:\Minor Project\Experiment\tier1_android_metrics.json", "r") as f:
    data = json.load(f)

# Split TTFTs into 'short' (intent) and 'long' (chat history) based on threshold (e.g., < 20s)
short_ttfts = [t for t in data["ttft_list"] if t < 20.0]
long_ttfts = [t for t in data["ttft_list"] if t >= 20.0]

toks_array = np.array(data["toks_list"])
ttft_short_array = np.array(short_ttfts)
ttft_long_array = np.array(long_ttfts)

mean_toks = np.mean(toks_array)
std_toks = np.std(toks_array)
mean_short_ttft = np.mean(ttft_short_array)
std_short_ttft = np.std(ttft_short_array)

# We know peak RAM is 1688732 KB -> 1.61 GiB / 1.69 GB
peak_ram_gb = 1688732 / (1024 * 1024)

# Open paper
doc_path = r"c:\Minor Project\Documentation\Research paper.docx"
doc = Document(doc_path)

# Add a subsection for Android Emulator Results
doc.add_heading("C. Android Emulator Inference Performance (Tier 1)", level=2)
p = doc.add_paragraph(
    "To simulate on-device execution, the model (Qwen 2.5 1.5B 4-bit quantized) was deployed to an Android Virtual Device "
    "(AVD) emulating a Google Pixel 7. The emulator was allocated 6GB of RAM and 4 virtual cores on the host x86_64 CPU. "
    "Unlike the PC benchmarks, the emulator introduces virtualization overhead and uses the llama.rn (React Native) wrapper."
)

p2 = doc.add_paragraph(
    "Due to the emulator's memory constraints, the context window (n_ctx) was initially limited but later expanded to 4096 tokens "
    "to prevent out-of-memory native crashes. The two-stage pipeline (intent classification followed by chat completion) resulted "
    "in KV-cache thrashing, causing the Time-to-First-Token (TTFT) for history-dependent prompts to scale linearly from 34s to over 200s. "
    "However, for short, independent prompts (e.g., intent classification), the TTFT remained stable. The peak RAM footprint during "
    "inference was measured at approximately "
)
p2.add_run(f"{peak_ram_gb:.2f} GB").bold = True
p2.add_run(".")

# Add Table V
doc.add_paragraph("Table V: Android Emulator (Pixel 7 AVD) Performance Metrics", style="Caption")
table = doc.add_table(rows=1, cols=3)
table.style = 'Table Grid'
hdr_cells = table.rows[0].cells
hdr_cells[0].text = 'Metric'
hdr_cells[1].text = 'Mean (n=10+)'
hdr_cells[2].text = 'Std Dev'

row_cells = table.add_row().cells
row_cells[0].text = 'Generation Speed (Tok/s)'
row_cells[1].text = f"{mean_toks:.2f}"
row_cells[2].text = f"{std_toks:.2f}"

row_cells = table.add_row().cells
row_cells[0].text = 'TTFT (Short Prompt)'
row_cells[1].text = f"{mean_short_ttft:.2f} s"
row_cells[2].text = f"{std_short_ttft:.2f} s"

row_cells = table.add_row().cells
row_cells[0].text = 'Peak Memory (RAM)'
row_cells[1].text = f"{peak_ram_gb:.2f} GB"
row_cells[2].text = "-"

doc.save(doc_path)
print("Paper updated with Android Emulator results.")
