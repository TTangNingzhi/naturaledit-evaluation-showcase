# NaturalEdit Result Viewer

A simple web-based viewer for technical evaluation results of NaturalEdit on two datasets, supporting two prompting strategies: **Direct Instruction Prompting** and **Summary-Mediated Prompting**.

**Deployed at:** [https://naturaledit-result-viewer.netlify.app/](https://naturaledit-result-viewer.netlify.app/)

**Contact:** Ningzhi Tang (ntang@nd.edu, ningzhitang2001@gmail.com)

## Purpose

This tool is designed to:
1. **Inspire user study task selection**: Help researchers identify suitable tasks for user studies by browsing real evaluation cases.
2. **Enable qualitative analysis**: Facilitate in-depth, qualitative inspection of technical evaluation results for different prompts and models.
3. **Support readers and collaborators**: Provide an accessible way for readers and team members to explore and understand evaluation outcomes.
4. **Iterate and refine prompts**: Make it easy to review and adjust prompt designs for NaturalEdit based on observed results.

## Features

- **Dataset/Model/Prompt Type Selection**: Switch between datasets (e.g., CanItEdit, EditEval), models (e.g., gpt-4o, gpt-3.5-turbo), and prompt types (e.g., lazy, descriptive, instruction) using dropdowns.
- **Result Comparison**: View and compare the outcomes of Direct Instruction Prompting and Summary-Mediated Prompting for each test case.
- **Error Inspection**: See error messages for failed cases.
- **Prompt & Summary Display**: Inspect the exact prompt and summary used for each evaluation.
- **Code Diff Visualization**: Compare buggy code, ground truth, and model outputs side-by-side with syntax highlighting and diff blocks.
- **Easy Navigation**: Browse through all evaluation samples with intuitive navigation controls.

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start the development server:**
   ```bash
   npm run dev
   ```
3. **Open the app:**  
   Visit the local URL shown in your terminal (typically http://localhost:5173).

## Data

Evaluation results are stored as `.jsonl` files in `public/data/`, named by dataset, model, and prompt type (e.g., `CanItEdit_gpt-4o_lazy.jsonl`). The viewer loads and displays these files dynamically.

---

For further customization or extension, please refer to `src/App.tsx` and related component implementations.
