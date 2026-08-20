# Therma-FinOps: Thermal-Aware Cloud Offloading Engine

A prototype workload management system that monitors local CPU temperature and multi-dimensional system risk in real-time, automatically offloading remaining tasks to an AWS EC2 instance (via Docker) when the **Unified Risk Index (URI)** crosses a decision threshold — applying a **FinOps** (Financial Operations) mindset to balance **compute cost vs. hardware safety vs. workload urgency**.

---

## Table of Contents

1. [High-Level Architecture](#high-level-architecture)
2. [Execution Flow](#execution-flow)
3. [Unified Risk Index (URI)](#unified-risk-index-uri)
4. [File-by-File Breakdown](#file-by-file-breakdown)
5. [How the Files Work Together](#how-the-files-work-together)
6. [Configuration (.env)](#configuration-env)
7. [Trigger Modes](#trigger-modes)
8. [EC2 / Cloud Setup](#ec2--cloud-setup)
9. [Running the Project](#running-the-project)
10. [Testing](#testing)

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      main.py                            │
│         (Entry Point — wires everything together)       │
└────────────┬──────────────┬─────────────────┬───────────┘
             │              │                 │
             ▼              ▼                 ▼
   local_monitor.py   offload_decision.py   tracker.py
   (Temp sensing,     (Execution pipeline    (Performance
    simulated data,    + URI rationale        metrics +
    URI evaluation)    logging)               URI analytics)
         │
         ▼
    uri_engine.py ◄──── uri_config.py
    (Pure math:          (All tunable
     D_hw, R_cloud,       constants from
     Q_edge, weights,     .env)
     URI, decision)
         │
         └──────────────────────────────┐
                                        ▼
                               cloud_executor.py
                               (SSH → EC2 → Docker)
```

---

## Execution Flow

```
START
  │
  ├─ 1. main.py creates a PerformanceTracker and a queue of 10 tasks
  │
  ├─ 2. main.py calls monitor_and_run() in local_monitor.py
  │     │
  │     ├─ Reads TRIGGER_MODE from config ("uri" or "threshold")
  │     │
  │     ├─ For each task in the queue:
  │     │
  │     │   ┌─── URI MODE ─────────────────────────────────────────┐
  │     │   │ a. Read CPU temperature (simulated thermal curve)    │
  │     │   │ b. Advance spot-price random walk (SIMULATED)        │
  │     │   │ c. Sample eviction probability (SIMULATED)           │
  │     │   │ d. Compute deadline remaining + task complexity      │
  │     │   │                                                      │
  │     │   │ e. D_hw  = hardware_depreciation(T_j, ...)          │
  │     │   │ f. R_cloud = cloud_risk(P_spot_history, p_evict, .) │
  │     │   │ g. Q_edge = queue_urgency(depth, deadline, ...)     │
  │     │   │ h. (α, β, γ) = dynamic_weights(T_j, σ_P, ...)     │
  │     │   │ i. URI = α·D_hw + β·R_cloud + γ·Q_edge             │
  │     │   │                                                      │
  │     │   │ j. Record URI snapshot in tracker                    │
  │     │   │                                                      │
  │     │   │ IF URI >= URI_THRESHOLD:                             │
  │     │   │   → Pass URI metadata + remaining tasks to           │
  │     │   │     evaluate_and_offload() → cloud_executor          │
  │     │   │   → Break                                            │
  │     │   │ ELSE:                                                │
  │     │   │   → Execute locally, record in tracker               │
  │     │   └──────────────────────────────────────────────────────┘
  │     │
  │     │   ┌─── THRESHOLD MODE (legacy) ──────────────────────────┐
  │     │   │ IF temp >= MAX_TEMP_THRESHOLD:                       │
  │     │   │   → offload remaining tasks                          │
  │     │   │ ELSE:                                                │
  │     │   │   → execute locally                                  │
  │     │   └──────────────────────────────────────────────────────┘
  │
  ├─ 3. main.py calls tracker.display_report()
  │     ├─ Local vs Cloud task summary (always)
  │     └─ URI Engine Analytics section (URI mode only)
  │
  └─ END
```

---

## Unified Risk Index (URI)

The URI is a composite risk score in **[0, 1]** that fuses three independent risk dimensions:

### Sub-Indices

| Sub-Index | Symbol | What it measures | Model |
|-----------|--------|-----------------|-------|
| Hardware Depreciation | `D_hw_hat` | How much running locally degrades the hardware | Arrhenius steady-state wear + Coffin-Manson cyclic fatigue, sigmoid-squashed |
| Cloud Risk | `R_cloud_hat` | How risky/expensive it is to offload right now | Rolling spot-price volatility + eviction-weighted penalty costs, sigmoid-squashed |
| Queue Urgency | `Q_edge_hat` | How urgent the remaining workload is | Queue depth + deadline pressure + task complexity, linearly combined and clamped |

### Dynamic Weights

The weights **(α, β, γ)** live on the probability simplex (sum to 1) and shift in real-time:

- **α (hardware)** — escalates via power law as `T_j → T_crit`
- **β (cloud risk)** — escalates as spot-price volatility rises
- **γ (queue urgency)** — residual, floored at `γ_min`

### Decision

```
URI(t) = α(t) · D_hw_hat(t) + β(t) · R_cloud_hat(t) + γ(t) · Q_edge_hat(t)

Offload if URI(t) >= URI_THRESHOLD
```

---

## File-by-File Breakdown

### `main.py` — Entry Point & Orchestrator

| Aspect  | Detail |
|---------|--------|
| **Role** | Ties all modules together; owns the top-level execution |
| **Imports** | `local_monitor.monitor_and_run`, `offload_decision.evaluate_and_offload`, `tracker.PerformanceTracker` |
| **Key Actions** | Creates a `PerformanceTracker`, builds a task queue of 10 items, kicks off `monitor_and_run()`, and finally prints the performance report |

This file contains **no business logic of its own** — it acts purely as the glue/coordinator.

---

### `uri_engine.py` — Pure Mathematical URI Functions

| Aspect  | Detail |
|---------|--------|
| **Role** | All URI math — zero dependencies on the rest of the codebase |
| **Testable** | Fully isolated; unit-tested via `test_uri_engine.py` |

**Functions:**

| Function | Purpose | Output |
|----------|---------|--------|
| `hardware_depreciation(...)` | Arrhenius + Coffin-Manson → sigmoid | `float [0,1]` |
| `cloud_risk(...)` | Spot volatility + eviction penalty → sigmoid | `(float [0,1], sigma_P)` |
| `queue_urgency(...)` | Depth + deadline + complexity → clamped | `float [0,1]` |
| `dynamic_weights(...)` | Simplex-constrained weight allocation | `(α, β, γ)` |
| `compute_uri(...)` | Weighted sum of sub-indices | `float [0,1]` |
| `should_offload(...)` | URI ≥ threshold? | `bool` |

---

### `uri_config.py` — Centralized Constants

| Aspect  | Detail |
|---------|--------|
| **Role** | Single source of truth for all URI tunable parameters |
| **Source** | Loads from `.env` via `python-dotenv`, with sensible defaults |
| **Sections** | Arrhenius/Coffin-Manson, Cloud Risk, Queue Urgency, Dynamic Weights, Sigmoid, Trigger Mode |

---

### `local_monitor.py` — Temperature Sensing, Simulation & URI Evaluation

| Aspect  | Detail |
|---------|--------|
| **Role** | Monitors CPU temperature, runs simulated data sources, evaluates URI or legacy threshold |
| **Config** | `TRIGGER_MODE`, `MAX_TEMP_THRESHOLD`, `URI_THRESHOLD` |

**Simulated data sources** (clearly marked `# --- SIMULATED ---`):

| Source | Simulation Method |
|--------|------------------|
| CPU Temperature | Choreographed thermal curve (`THERMAL_DELTAS`) — **unchanged from original** |
| Spot Price (`P_spot`) | Random-walk from `$0.04/hr`, Gaussian steps (σ=0.005), seeded |
| Eviction Probability (`p_evict`) | Base `0.05` with Gaussian jitter |
| Deadline Remaining | Linear countdown from `120s` batch start |
| Task Complexity | Linear ramp from `3.0` to `8.0` across 10 tasks |

**Key functions:**

- **`get_cpu_temperature()`** — Unchanged from original.
- **`cpu_stress_task(task_id)`** — Unchanged from original.
- **`monitor_and_run(tasks, offload_callback, tracker)`** — Now supports dual trigger mode.

---

### `offload_decision.py` — Execution Pipeline

| Aspect  | Detail |
|---------|--------|
| **Role** | The offload *execution* pipeline (decision happens upstream via URI) |
| **Change** | Accepts optional `uri_data` dict; logs full URI rationale |

**Function:**

- **`evaluate_and_offload(remaining_tasks, current_temp, tracker, uri_data=None)`** — Logs URI sub-components and weights when present, then executes remaining tasks on cloud.

---

### `tracker.py` — Performance Metrics & URI Analytics

| Aspect  | Detail |
|---------|--------|
| **Role** | Centralized bookkeeping for all task executions and URI evaluations |

**Methods:**

| Method | Purpose |
|--------|---------|
| `record_execution(env, task_id, duration)` | Logs successful task (unchanged) |
| `record_error(env, task_id)` | Logs failed task (unchanged) |
| `record_uri_snapshot(uri_data)` | **NEW** — stores per-task URI evaluation data |
| `display_report()` | Prints local/cloud summary + URI analytics |

**URI Analytics section** (appended below existing report):
- Per-task URI trace table (temp, sub-indices, weights, URI, decision)
- Averages across all evaluations
- Trigger-point breakdown (what caused the offload)

---

### `test_uri_engine.py` — Unit Tests

Comprehensive tests for all 6 URI functions + sigmoid helper:

| Test Class | Cases |
|------------|-------|
| `TestHardwareDepreciation` | Nominal, at T_ref, at T_crit, extreme temp, output range |
| `TestCloudRisk` | Nominal, empty history, single price, zero/high eviction, range |
| `TestQueueUrgency` | Nominal, empty queue, deadline passed, negative deadline, full queue, range |
| `TestDynamicWeights` | Simplex constraint, gamma floor, alpha escalation, beta escalation |
| `TestComputeURI` | Weighted sum, all-zero, all-max |
| `TestShouldOffload` | Above/at/below threshold, boundary |
| `TestSigmoid` | Midpoint, large positive/negative |

---

### `.env` — Configuration

All tunable parameters (original 6 + URI parameters):

<details>
<summary>Click to expand full parameter list</summary>

| Variable | Purpose | Default |
|----------|---------|---------|
| `MAX_TEMP_THRESHOLD` | Legacy mode threshold (°C) | `75.0` |
| `AWS_EC2_IP` | Public IP of EC2 instance | — |
| `AWS_EC2_USER` | SSH username | `ec2-user` |
| `AWS_SSH_KEY_PATH` | Path to `.pem` key | — |
| `DOCKER_IMAGE_NAME` | Docker image on EC2 | `therma-finops-worker:latest` |
| `CLOUD_COST_PER_HOUR` | Notional cost factor | `0.04` |
| `TRIGGER_MODE` | `"uri"` or `"threshold"` | `uri` |
| `URI_THRESHOLD` | URI decision boundary [0,1] | `0.55` |
| `E_A` | Arrhenius activation energy (eV) | `0.7` |
| `T_REF` | Reference temperature (K) | `318.15` |
| `T_CRIT` | Critical temperature (K) | `358.15` |
| `COFFIN_MANSON_N` | Fatigue exponent | `2.0` |
| `COFFIN_MANSON_C` | Material constant | `10000` |
| `W1, W2` | Arrhenius vs Coffin-Manson weights | `0.6, 0.4` |
| `MU1, MU2` | Volatility vs eviction weights | `0.5, 0.5` |
| `NU1, NU2, NU3` | Queue urgency sub-weights | `0.4, 0.35, 0.25` |
| `ALPHA0, ALPHA_MAX` | Hardware weight range | `0.33, 0.70` |
| `BETA0, BETA_MAX` | Cloud risk weight range | `0.33, 0.50` |
| `GAMMA_MIN` | Queue urgency weight floor | `0.10` |

</details>

---

### Unchanged Files

| File | Purpose |
|------|---------|
| `cloud_executor.py` | SSH + Docker remote execution (untouched) |
| `setup.txt` | EC2 bootstrap script (untouched) |
| `labsuser.pem` | SSH private key (untouched) |

---

## How the Files Work Together

```
main.py
  │
  │  1. Creates a shared PerformanceTracker instance
  │  2. Passes evaluate_and_offload (from offload_decision.py) as a
  │     callback into monitor_and_run (in local_monitor.py)
  │
  ├──► local_monitor.py
  │       • Reads TRIGGER_MODE from uri_config.py
  │       • Owns the task loop and temperature checks
  │       • Runs simulated data generators (spot price, eviction, deadline)
  │       •
  │       • [URI MODE]:
  │       │   Calls uri_engine functions to compute D_hw, R_cloud, Q_edge,
  │       │   dynamic weights, and final URI score.
  │       │   Records URI snapshot in tracker every iteration.
  │       │   If URI >= threshold → bundles uri_data dict and calls callback.
  │       │
  │       • [THRESHOLD MODE]:
  │       │   If temp >= MAX_TEMP_THRESHOLD → calls callback (no uri_data).
  │       │
  │       │ Both modes call:
  │       │
  ├──► offload_decision.py  (evaluate_and_offload)
  │       • Receives remaining tasks + tracker + optional uri_data
  │       • Logs URI rationale (sub-indices, weights) if present
  │       • For each task, calls:
  │
  ├──────► cloud_executor.py  (execute_on_cloud)  [UNTOUCHED]
  │           • SSH → EC2 → Docker run
  │           • Returns execution time
  │
  ├──► uri_engine.py  (called by local_monitor)
  │       • Pure math — no side effects
  │       • All constants from uri_config.py
  │
  ├──► uri_config.py  (imported by local_monitor + uri_engine tests)
  │       • Loads all tunable params from .env
  │
  └──► tracker.py
          • Shared across ALL modules via the same object reference
          • local_monitor records local executions + URI snapshots
          • offload_decision records cloud executions & errors
          • main.py calls display_report() at the very end
```

---

## Trigger Modes

Set `TRIGGER_MODE` in `.env`:

| Mode | Value | Behavior |
|------|-------|----------|
| **URI** (default) | `TRIGGER_MODE=uri` | Full Unified Risk Index evaluation every iteration |
| **Threshold** (legacy) | `TRIGGER_MODE=threshold` | Original binary `temp >= 75°C` check |

Both modes can be compared for the paper's evaluation section.

---

## EC2 / Cloud Setup

See `setup.txt` for the bash script to run on a fresh AWS Academy EC2 instance. It installs Docker, creates the worker directory, generates `run_worker.py` and `Dockerfile`, and builds the image.

---

## Running the Project

### Prerequisites

- Python 3.9+
- `pip install paramiko python-dotenv`
- A running AWS EC2 instance set up with `setup.txt`
- `.env` updated with the current EC2 public IP

### Launch (URI Mode — Default)

```bash
python main.py
```

### Launch (Legacy Threshold Mode)

```bash
# Windows
set TRIGGER_MODE=threshold && python main.py

# Linux/Mac
TRIGGER_MODE=threshold python main.py
```

---

## Testing

### Run Unit Tests

```bash
python -m unittest test_uri_engine -v
# or
python -m pytest test_uri_engine.py -v
```

### Expected Test Coverage

- 30+ test cases covering all 6 URI functions + sigmoid helper
- Nominal cases, edge cases (T_j == T_crit, empty queue, passed deadline, empty price history), and output-range validation

---

## Dependencies

| Package | Purpose |
|---------|---------|
| `paramiko` | SSH client for connecting to EC2 |
| `python-dotenv` | Loads `.env` variables into `os.environ` |
| `math`, `statistics`, `random`, `time`, `subprocess`, `json`, `os` | Standard library modules |
