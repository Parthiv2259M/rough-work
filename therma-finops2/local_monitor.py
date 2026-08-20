import os
import time
import math
import random
import subprocess
from dotenv import load_dotenv

load_dotenv()
TEMP_THRESHOLD = float(os.getenv("MAX_TEMP_THRESHOLD", 75.0))

# --- Import URI engine and config ---
import uri_config as cfg
from uri_engine import (
    hardware_depreciation,
    cloud_risk,
    queue_urgency,
    dynamic_weights,
    compute_uri,
    should_offload,
)

# --- EXISTING SIMULATION: Temperature Curve ---
# (Unchanged — this is the original simulated thermal ramp)
# Gradual thermal ramp: ~30 → 35 → 42 → 50 → 58 → 65 → 72 → 78 → 83 → 87 °C
THERMAL_DELTAS = [5.0, 7.0, 8.0, 8.0, 7.0, 7.0, 6.0, 5.0, 4.0, 3.0]
CURRENT_STEP = 0
SIMULATED_HEAT_OFFSET = 0.0


# =========================================================================
# --- SIMULATED DATA SOURCES (for URI sub-indices) ---
# These mock the real-time feeds that don't exist in this prototype,
# following the same pattern as THERMAL_DELTAS above.
# =========================================================================

# --- SIMULATED: AWS Spot Price History ---
# Predetermined sequence: stable for first 4 tasks, then a market spike at task 5.
# This drives the cloud risk sub-index (R_cloud_hat) upward mid-batch.
_spot_rng = random.Random(42)
_PREDETERMINED_SPOT_PRICES = [
    0.040, 0.041, 0.039, 0.042,   # tasks 1-4: calm market
    0.038, 0.065, 0.085, 0.095,   # task 5+:  price spike / volatility surge
    0.110, 0.130, 0.150,
]
SIMULATED_P_SPOT_HISTORY = [_PREDETERMINED_SPOT_PRICES[0]]
_spot_step = 0


def _generate_next_spot_price():
    """
    SIMULATED: Feeds the next predetermined spot price into the history.
    After the sequence is exhausted, continues with mild random noise.
    """
    global _spot_step
    _spot_step += 1
    if _spot_step < len(_PREDETERMINED_SPOT_PRICES):
        new_price = _PREDETERMINED_SPOT_PRICES[_spot_step]
    else:
        last = SIMULATED_P_SPOT_HISTORY[-1]
        new_price = max(0.005, last + _spot_rng.gauss(0.0, 0.005))
    SIMULATED_P_SPOT_HISTORY.append(round(new_price, 6))
    return new_price


# --- SIMULATED: Spot Instance Eviction Probability ---
# Escalating eviction risk: low during stable market, spikes with price surge.
_PREDETERMINED_EVICT_PROBS = [
    0.03, 0.04, 0.05, 0.06,       # tasks 1-4: low eviction risk
    0.08, 0.20, 0.30, 0.40,       # task 5+:  eviction risk climbs
    0.50, 0.55, 0.60,
]
_evict_step = 0


def _get_simulated_p_evict():
    """
    SIMULATED: Returns the next predetermined eviction probability.
    """
    global _evict_step
    idx = min(_evict_step, len(_PREDETERMINED_EVICT_PROBS) - 1)
    prob = _PREDETERMINED_EVICT_PROBS[idx]
    _evict_step += 1
    return prob


# --- SIMULATED: Task Deadline & Complexity ---
SIMULATED_TOTAL_DEADLINE_SECONDS = 25.0  # tight batch deadline from start
_batch_start_time = None


def _get_simulated_deadline_remaining():
    """
    SIMULATED: Returns seconds remaining until the batch deadline.
    Deadline decreases linearly as wall-clock time passes.
    """
    global _batch_start_time
    if _batch_start_time is None:
        _batch_start_time = time.time()
    elapsed = time.time() - _batch_start_time
    return max(0.0, SIMULATED_TOTAL_DEADLINE_SECONDS - elapsed)


def _get_simulated_task_complexity(task_id):
    """
    SIMULATED: Assigns a complexity score based on task index.
    Ranges from 3.0 to 8.0 across the 10-task batch.
    """
    # Extract the numeric index from task_id like "task_batch_3"
    try:
        idx = int(task_id.split("_")[-1])
    except (ValueError, IndexError):
        idx = 5
    # Linearly scale: task 1 → 3.0, task 10 → 8.0
    return 3.0 + (idx - 1) * (5.0 / 9.0)


# =========================================================================
# Core Functions (get_cpu_temperature and cpu_stress_task are unchanged)
# =========================================================================

def get_cpu_temperature():
    """
    Fetches the base CPU temp, but artificially raises it using a 
    non-uniform, choreographed thermal curve to guarantee a threshold breach.
    """
    global SIMULATED_HEAT_OFFSET, CURRENT_STEP
    base_temp_c = None
    try:
        output = subprocess.check_output(
            ["wmic", "/namespace:\\\\root\\wmi", "PATH", "MSAcpi_ThermalZoneTemperature", "get", "CurrentTemperature"],
            creationflags=subprocess.CREATE_NO_WINDOW
        )
        
        lines = output.decode('utf-8').strip().split('\n')
        for line in lines:
            line = line.strip()
            if line.isdigit():
                base_temp_c = (float(line) / 10.0) - 273.15
                break
    except Exception as e:
        # WMI access may require admin privileges; fall back to simulated base
        pass

    # Fallback: if WMI didn't return a value, use a typical idle temp
    if base_temp_c is None:
        base_temp_c = 30.0  # Simulated baseline — starts cool, ramps up visibly

    # Apply the current accumulated heat from the simulated thermal curve
    current_temp = base_temp_c + SIMULATED_HEAT_OFFSET

    # Prepare the offset for the NEXT time the temperature is checked
    if CURRENT_STEP < len(THERMAL_DELTAS):
        SIMULATED_HEAT_OFFSET += THERMAL_DELTAS[CURRENT_STEP]
        CURRENT_STEP += 1

    return round(current_temp, 2)


def cpu_stress_task(task_id, duration_seconds=5):
    """
    A CPU-bound task designed to raise hardware temperature.
    Calculates factorials in a tight loop.
    """
    print(f"Executing Local Task {task_id}...")
    end_time = time.time() + duration_seconds
    while time.time() < end_time:
        math.factorial(10000) 
    return True


# =========================================================================
# Main Loop — Dual Trigger Mode (URI or Legacy Threshold)
# =========================================================================

def monitor_and_run(tasks, offload_callback, tracker):
    """
    Iterates through tasks, monitoring system state each iteration.
    
    TRIGGER_MODE (from .env / uri_config):
      - "uri"       : Computes the full Unified Risk Index and offloads when
                      URI >= URI_THRESHOLD.  This is the new default.
      - "threshold" : Legacy mode — offloads purely on temp >= MAX_TEMP_THRESHOLD.
    """
    trigger_mode = cfg.TRIGGER_MODE
    print(f"[Config] Trigger mode: {trigger_mode.upper()}")

    for i, task in enumerate(tasks):
        current_temp = get_cpu_temperature()
        
        if current_temp is None:
            print("Halting execution: Cannot read thermal data.")
            break

        # --- Prominent temperature display ---
        temp_bar = "#" * int(current_temp / 3)  # visual bar
        print(f"\n{'='*60}")
        print(f"  TASK {i+1}/{len(tasks)}: {task}")
        print(f"  [TEMP] CPU Temperature: {current_temp} C  |{temp_bar}|")
        print(f"{'='*60}")

        # Convert to Kelvin for URI calculations
        T_j_kelvin = current_temp + 273.15
        # Thermal swing = difference from reference (in K, same magnitude as °C diff)
        delta_T = max(0.0, current_temp - (cfg.T_REF - 273.15))

        # Calculate remaining tasks count (queue depth for this iteration)
        remaining_count = len(tasks) - i

        if trigger_mode == "uri":
            # -------------------------------------------------------
            # URI MODE: Full Unified Risk Index evaluation
            # -------------------------------------------------------

            # Advance simulated data sources
            _generate_next_spot_price()
            p_evict = _get_simulated_p_evict()
            deadline_remaining = _get_simulated_deadline_remaining()
            task_complexity = _get_simulated_task_complexity(task)

            # 1. Compute sub-indices
            D_hw_hat = hardware_depreciation(
                T_j=T_j_kelvin, T_ref=cfg.T_REF, E_a=cfg.E_A, k_b=cfg.K_B,
                delta_T=delta_T, n=cfg.COFFIN_MANSON_N, C=cfg.COFFIN_MANSON_C,
                L0=cfg.L0, f_cyc=cfg.F_CYC, w1=cfg.W1, w2=cfg.W2,
                k_D=cfg.K_D, D_mid=cfg.D_MID
            )

            R_cloud_hat, sigma_P = cloud_risk(
                P_spot_history=SIMULATED_P_SPOT_HISTORY,
                p_evict=p_evict, C_penalty=cfg.C_PENALTY,
                C_migrate=cfg.C_MIGRATE, L_reexec=cfg.L_REEXEC,
                lambda_cost=cfg.LAMBDA_COST, P_ref=cfg.P_REF,
                C_ref=cfg.C_REF, mu1=cfg.MU1, mu2=cfg.MU2,
                k_R=cfg.K_R, R_mid=cfg.R_MID, window_W=cfg.WINDOW_W
            )

            Q_edge_hat = queue_urgency(
                queue_depth=remaining_count, q_max=cfg.Q_MAX,
                deadline_remaining=deadline_remaining,
                task_complexity=task_complexity,
                c_max=cfg.C_MAX, nu1=cfg.NU1, nu2=cfg.NU2,
                nu3=cfg.NU3, epsilon=cfg.EPSILON
            )

            # 2. Compute dynamic weights
            alpha, beta, gamma = dynamic_weights(
                T_j=T_j_kelvin, T_crit=cfg.T_CRIT,
                sigma_P=sigma_P, sigma_P_bar=cfg.SIGMA_P_BAR,
                alpha0=cfg.ALPHA0, alpha_max=cfg.ALPHA_MAX,
                beta0=cfg.BETA0, beta_max=cfg.BETA_MAX,
                p_exp=cfg.P_EXP, kappa=cfg.KAPPA,
                gamma_min=cfg.GAMMA_MIN
            )

            # 3. Compute URI
            uri_value = compute_uri(D_hw_hat, R_cloud_hat, Q_edge_hat,
                                    alpha, beta, gamma)

            print(f"  [URI] = {uri_value:.4f}  (threshold = {cfg.URI_THRESHOLD})")
            print(f"     Sub-indices:  D_hw={D_hw_hat:.3f}  R_cloud={R_cloud_hat:.3f}  Q_edge={Q_edge_hat:.3f}")
            print(f"     Weights (a,b,g): ({alpha:.3f}, {beta:.3f}, {gamma:.3f})")

            # Record snapshot for analytics (every iteration)
            uri_data = {
                'T_j': current_temp,
                'D_hw_hat': D_hw_hat,
                'R_cloud_hat': R_cloud_hat,
                'Q_edge_hat': Q_edge_hat,
                'alpha': alpha,
                'beta': beta,
                'gamma': gamma,
                'uri': uri_value,
                'decision': None  # filled below
            }

            # 4. Decision
            if should_offload(uri_value, cfg.URI_THRESHOLD):
                uri_data['decision'] = 'cloud'
                tracker.record_uri_snapshot(uri_data)

                print(f"  !! URI THRESHOLD ({cfg.URI_THRESHOLD}) BREACHED -- triggering offload!")
                remaining_tasks = tasks[i:]
                offload_callback(remaining_tasks, current_temp, tracker, uri_data=uri_data)
                break
            else:
                uri_data['decision'] = 'local'
                tracker.record_uri_snapshot(uri_data)

                # Execute locally
                start_time = time.time()
                cpu_stress_task(task)
                exec_time = time.time() - start_time
                tracker.record_execution('local', task, exec_time)

        else:
            # -------------------------------------------------------
            # LEGACY THRESHOLD MODE (unchanged from original)
            # -------------------------------------------------------
            if current_temp >= TEMP_THRESHOLD:
                print(f"WARNING: Thermal threshold ({TEMP_THRESHOLD}°C) breached!")
                remaining_tasks = tasks[tasks.index(task):]
                offload_callback(remaining_tasks, current_temp, tracker)
                break
            else:
                # Execute locally
                start_time = time.time()
                cpu_stress_task(task)
                exec_time = time.time() - start_time
                tracker.record_execution('local', task, exec_time)

        time.sleep(1)  # Brief pause between tasks