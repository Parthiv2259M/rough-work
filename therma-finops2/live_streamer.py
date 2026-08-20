import json
import os
import time
import uri_config as cfg
from uri_engine import (
    compute_uri,
    dynamic_weights,
    hardware_depreciation,
    queue_urgency,
    should_offload,
    cloud_risk,
)

METRICS_FILE = "live_metrics.json"
TOTAL_TICKS = 15
TICK_INTERVAL = 2.0  # 30 seconds total runtime

# Remove any old stream file
if os.path.exists(METRICS_FILE):
    os.remove(METRICS_FILE)

base_temp = 30.0
thermal_deltas = [5.0, 7.0, 8.0, 8.0, 7.0, 7.0, 6.0, 5.0, 4.0, 3.0, 2.0, 2.0, 2.0, 2.0, 2.0]
spot_prices = [0.040, 0.041, 0.039, 0.042, 0.038, 0.065, 0.085, 0.095, 0.110, 0.130, 0.150, 0.150, 0.150, 0.150, 0.150]
evict_probs = [0.03, 0.04, 0.05, 0.06, 0.08, 0.20, 0.30, 0.40, 0.50, 0.55, 0.60, 0.60, 0.60, 0.60, 0.60]

price_history = [spot_prices[0]]
curr_temp = base_temp
start_time = time.time()

print("Starting Python URI Streamer (Writing to live_metrics.json)...")

for tick in range(1, TOTAL_TICKS + 1):
    curr_temp += thermal_deltas[tick - 1]
    p_spot = spot_prices[tick - 1]
    price_history.append(p_spot)
    p_evict = evict_probs[tick - 1]
    
    elapsed = round(time.time() - start_time, 2)
    deadline_rem = max(0.0, 30.0 - elapsed)
    queue_depth = max(1, 10 - (tick - 1))
    task_complexity = 3.0 + min(tick - 1, 9) * (5.0 / 9.0)

    T_j = curr_temp + 273.15
    delta_T = max(0.0, curr_temp - (cfg.T_REF - 273.15))

    D_hw = hardware_depreciation(
        T_j=T_j, T_ref=cfg.T_REF, E_a=cfg.E_A, k_b=cfg.K_B,
        delta_T=delta_T, n=cfg.COFFIN_MANSON_N, C=cfg.COFFIN_MANSON_C,
        L0=cfg.L0, f_cyc=cfg.F_CYC, w1=cfg.W1, w2=cfg.W2,
        k_D=cfg.K_D, D_mid=cfg.D_MID
    )

    R_cloud, sigma_P = cloud_risk(
        P_spot_history=price_history, p_evict=p_evict,
        C_penalty=cfg.C_PENALTY, C_migrate=cfg.C_MIGRATE, L_reexec=cfg.L_REEXEC,
        lambda_cost=cfg.LAMBDA_COST, P_ref=cfg.P_REF, C_ref=cfg.C_REF,
        mu1=cfg.MU1, mu2=cfg.MU2, k_R=cfg.K_R, R_mid=cfg.R_MID, window_W=cfg.WINDOW_W
    )

    Q_edge = queue_urgency(
        queue_depth=queue_depth, q_max=cfg.Q_MAX,
        deadline_remaining=deadline_rem, task_complexity=task_complexity,
        c_max=cfg.C_MAX, nu1=cfg.NU1, nu2=cfg.NU2, nu3=cfg.NU3, epsilon=cfg.EPSILON
    )

    alpha, beta, gamma = dynamic_weights(
        T_j=T_j, T_crit=cfg.T_CRIT, sigma_P=sigma_P, sigma_P_bar=cfg.SIGMA_P_BAR,
        alpha0=cfg.ALPHA0, alpha_max=cfg.ALPHA_MAX, beta0=cfg.BETA0, beta_max=cfg.BETA_MAX,
        p_exp=cfg.P_EXP, kappa=cfg.KAPPA, gamma_min=cfg.GAMMA_MIN
    )

    uri = compute_uri(D_hw, R_cloud, Q_edge, alpha, beta, gamma)
    decision = "cloud" if should_offload(uri, cfg.URI_THRESHOLD) else "local"

    # Atomic write to JSON
    payload = {
        "tick": tick,
        "elapsed": elapsed,
        "temp": curr_temp,
        "D_hw": D_hw,
        "R_cloud": R_cloud,
        "Q_edge": Q_edge,
        "alpha": alpha,
        "beta": beta,
        "gamma": gamma,
        "uri": uri,
        "threshold": cfg.URI_THRESHOLD,
        "decision": decision,
        "is_finished": (tick == TOTAL_TICKS)
    }

    temp_file = METRICS_FILE + ".tmp"
    with open(temp_file, "w") as f:
        json.dump(payload, f)
    os.replace(temp_file, METRICS_FILE)

    print(f"Tick {tick:02d}/{TOTAL_TICKS} | Temp: {curr_temp:.1f}°C | URI: {uri:.4f} | Action: {decision}")
    time.sleep(TICK_INTERVAL)

print("Python simulation complete.")