# uri_engine.py
"""
Unified Risk Index (URI) Decision Engine
=========================================
Pure mathematical functions for computing the URI — a composite risk score
that determines whether to offload workload to the cloud.

URI(t) = alpha(t) * D_hw_hat(t) + beta(t) * R_cloud_hat(t) + gamma(t) * Q_edge_hat(t)

Each sub-index is normalized to [0, 1]:
  - D_hw_hat : Hardware depreciation risk (Arrhenius + Coffin-Manson)
  - R_cloud_hat : Cloud cost / eviction risk (spot-price volatility + penalties)
  - Q_edge_hat : Queue urgency (depth + deadline pressure + task complexity)

Dynamic weights (alpha, beta, gamma) live on the simplex and shift based on
real-time thermal and market conditions.

This module has NO dependencies on the rest of the codebase and can be
unit-tested in complete isolation.
"""

import math
import statistics


# ---------------------------------------------------------------------------
# 1. Hardware Depreciation Index
# ---------------------------------------------------------------------------
def hardware_depreciation(T_j, T_ref, E_a, k_b, delta_T, n, C, L0, f_cyc,
                          w1, w2, k_D, D_mid):
    """
    Computes the hardware depreciation risk score in [0, 1].

    Combines two physics-based degradation models:
      • Arrhenius steady-state wear  — accelerated aging at elevated junction
        temperature, expressed as an acceleration factor relative to T_ref.
      • Coffin-Manson cyclic fatigue — thermal cycling damage proportional to
        temperature swing amplitude and cycling frequency.

    The weighted combination is squashed to [0, 1] via a logistic sigmoid.

    Parameters
    ----------
    T_j : float
        Current junction temperature in **Kelvin**.
    T_ref : float
        Reference (safe baseline) temperature in **Kelvin**.
    E_a : float
        Activation energy for the dominant wear-out mechanism (eV).
    k_b : float
        Boltzmann constant (eV/K).  Typically 8.617e-5.
    delta_T : float
        Peak-to-peak thermal swing (K) experienced during cycling.
    n : float
        Coffin-Manson fatigue exponent (material-dependent, typically 1.5–3).
    C : float
        Coffin-Manson material constant.
    L0 : float
        Baseline component lifetime (hours) at T_ref.
    f_cyc : float
        Number of thermal cycles per evaluation window.
    w1 : float
        Weight for the Arrhenius (steady-state) component.  w1 + w2 = 1.
    w2 : float
        Weight for the Coffin-Manson (cyclic) component.
    k_D : float
        Sigmoid steepness parameter.
    D_mid : float
        Sigmoid midpoint — raw score at which output = 0.5.

    Returns
    -------
    float
        Hardware depreciation risk, range [0, 1].
    """
    # --- Arrhenius acceleration factor ---
    # AF = exp( (E_a / k_b) * (1/T_ref - 1/T_j) )
    # When T_j > T_ref, the exponent is positive → AF > 1 (accelerated wear).
    try:
        arrhenius_exp = (E_a / k_b) * (1.0 / T_ref - 1.0 / T_j)
        AF = math.exp(arrhenius_exp)
    except OverflowError:
        AF = 1e6  # cap at a very large number

    # Normalize: fraction of baseline lifetime consumed per unit time
    # Higher AF → faster consumption → higher risk
    arrhenius_norm = 1.0 - (1.0 / AF) if AF > 0 else 0.0
    arrhenius_norm = max(0.0, min(1.0, arrhenius_norm))

    # --- Coffin-Manson cyclic fatigue ---
    # N_f = C * (delta_T)^(-n)  — cycles to failure
    if delta_T > 0 and C > 0:
        N_f = C * (delta_T ** (-n))
        # Damage fraction per window = f_cyc / N_f
        cyclic_damage = f_cyc / N_f if N_f > 0 else 1.0
    else:
        cyclic_damage = 0.0
    cyclic_damage = max(0.0, min(1.0, cyclic_damage))

    # --- Weighted combination ---
    raw = w1 * arrhenius_norm + w2 * cyclic_damage

    # --- Sigmoid squash to [0, 1] ---
    D_hw_hat = _sigmoid(raw, k_D, D_mid)
    return D_hw_hat


# ---------------------------------------------------------------------------
# 2. Cloud Risk Index
# ---------------------------------------------------------------------------
def cloud_risk(P_spot_history, p_evict, C_penalty, C_migrate, L_reexec,
               lambda_cost, P_ref, C_ref, mu1, mu2, k_R, R_mid, window_W):
    """
    Computes the cloud cost / eviction risk score in [0, 1].

    Two components:
      • Rolling price volatility — standard deviation of the last `window_W`
        spot-price observations, normalized by a reference price.
      • Eviction-weighted penalty — probability of preemption multiplied by
        the composite cost of eviction (penalty + migration + re-execution),
        normalized by a reference cost.

    Parameters
    ----------
    P_spot_history : list[float]
        Recent spot-price observations ($/hr).  May be shorter than window_W.
    p_evict : float
        Current probability of spot-instance eviction, range [0, 1].
    C_penalty : float
        Dollar cost incurred on eviction (lost work penalty).
    C_migrate : float
        Dollar cost of migrating state to a replacement instance.
    L_reexec : float
        Dollar cost of re-executing the interrupted task.
    lambda_cost : float
        Cost scaling factor for normalization.
    P_ref : float
        Reference spot price ($/hr) for volatility normalization.
    C_ref : float
        Reference composite cost for penalty normalization.
    mu1 : float
        Weight for the volatility component.  mu1 + mu2 = 1.
    mu2 : float
        Weight for the eviction-penalty component.
    k_R : float
        Sigmoid steepness parameter.
    R_mid : float
        Sigmoid midpoint.
    window_W : int
        Number of most-recent observations for the rolling window.

    Returns
    -------
    float
        Cloud risk score, range [0, 1].
    """
    # --- Price volatility ---
    if len(P_spot_history) >= 2:
        window = P_spot_history[-window_W:] if len(P_spot_history) >= window_W else P_spot_history
        sigma_P = statistics.stdev(window)
        volatility_norm = sigma_P / P_ref if P_ref > 0 else 0.0
    else:
        sigma_P = 0.0
        volatility_norm = 0.0
    volatility_norm = max(0.0, min(1.0, volatility_norm))

    # --- Eviction-weighted penalty cost ---
    eviction_cost = p_evict * (C_penalty + C_migrate + L_reexec)
    penalty_norm = (lambda_cost * eviction_cost) / C_ref if C_ref > 0 else 0.0
    penalty_norm = max(0.0, min(1.0, penalty_norm))

    # --- Weighted combination + sigmoid ---
    raw = mu1 * volatility_norm + mu2 * penalty_norm
    R_cloud_hat = _sigmoid(raw, k_R, R_mid)

    return R_cloud_hat, sigma_P


# ---------------------------------------------------------------------------
# 3. Queue Urgency Index
# ---------------------------------------------------------------------------
def queue_urgency(queue_depth, q_max, deadline_remaining, task_complexity,
                  c_max, nu1, nu2, nu3, epsilon):
    """
    Computes the queue / workload urgency score in [0, 1].

    Three additive components:
      • Queue depth pressure  — fraction of queue capacity consumed.
      • Deadline pressure     — increases as time-to-deadline shrinks.
      • Task complexity       — fraction of maximum complexity rating.

    Parameters
    ----------
    queue_depth : int
        Number of tasks currently waiting in the queue.
    q_max : float
        Maximum queue depth for normalization.
    deadline_remaining : float
        Seconds remaining until the overall batch deadline.
        When <= 0, deadline pressure is maximized.
    task_complexity : float
        Complexity rating of the current/next task (arbitrary scale 0–c_max).
    c_max : float
        Maximum complexity score for normalization.
    nu1 : float
        Weight for queue-depth component.
    nu2 : float
        Weight for deadline-pressure component.
    nu3 : float
        Weight for task-complexity component.
    epsilon : float
        Small constant to prevent division by zero.

    Returns
    -------
    float
        Queue urgency score, range [0, 1].
    """
    # Queue depth component
    depth_ratio = queue_depth / q_max if q_max > 0 else 0.0

    # Deadline pressure: approaches 1 as deadline_remaining → 0
    if deadline_remaining <= 0:
        deadline_pressure = 1.0
    else:
        deadline_pressure = 1.0 - (deadline_remaining / (deadline_remaining + epsilon))

    # Task complexity component
    complexity_ratio = task_complexity / c_max if c_max > 0 else 0.0

    raw = nu1 * depth_ratio + nu2 * deadline_pressure + nu3 * complexity_ratio
    Q_edge_hat = max(0.0, min(1.0, raw))
    return Q_edge_hat


# ---------------------------------------------------------------------------
# 4. Dynamic Weights (Simplex-Constrained)
# ---------------------------------------------------------------------------
def dynamic_weights(T_j, T_crit, sigma_P, sigma_P_bar, alpha0, alpha_max,
                    beta0, beta_max, p_exp, kappa, gamma_min):
    """
    Computes dynamic weights (alpha, beta, gamma) on the probability simplex
    (alpha + beta + gamma = 1).

    • alpha (hardware weight) escalates via a power law as T_j approaches T_crit.
    • beta  (cloud risk weight) escalates as spot-price volatility rises.
    • gamma (queue urgency weight) is the residual, floored at gamma_min.

    If the raw weights exceed 1 (after enforcing gamma_min), they are
    re-normalized onto the simplex.

    Parameters
    ----------
    T_j : float
        Current junction temperature (K).
    T_crit : float
        Critical temperature (K) — the upper danger boundary.
    sigma_P : float
        Current rolling standard deviation of spot prices.
    sigma_P_bar : float
        Mean/reference standard deviation for normalization.
    alpha0 : float
        Baseline alpha weight.
    alpha_max : float
        Maximum alpha weight.
    beta0 : float
        Baseline beta weight.
    beta_max : float
        Maximum beta weight.
    p_exp : float
        Power-law exponent for alpha escalation.
    kappa : float
        Scaling factor for beta escalation with volatility.
    gamma_min : float
        Floor for the gamma (queue urgency) weight.

    Returns
    -------
    tuple[float, float, float]
        (alpha, beta, gamma) — weights summing to 1.0.
    """
    # --- Alpha: escalates as T_j → T_crit ---
    if T_j >= T_crit:
        alpha = alpha_max
    elif T_crit > T_j:
        thermal_ratio = (T_j - 273.15) / (T_crit - 273.15) if (T_crit - 273.15) > 0 else 0.0
        thermal_ratio = max(0.0, min(1.0, thermal_ratio))
        alpha = alpha0 + (alpha_max - alpha0) * (thermal_ratio ** p_exp)
    else:
        alpha = alpha0

    # --- Beta: escalates with spot-price volatility ---
    vol_ratio = sigma_P / sigma_P_bar if sigma_P_bar > 0 else 0.0
    beta = beta0 + (beta_max - beta0) * min(1.0, kappa * vol_ratio)
    beta = min(beta, beta_max)

    # --- Gamma: residual, floored ---
    gamma = max(gamma_min, 1.0 - alpha - beta)

    # --- Re-normalize onto the simplex ---
    total = alpha + beta + gamma
    if total > 0:
        alpha /= total
        beta /= total
        gamma /= total

    return alpha, beta, gamma


# ---------------------------------------------------------------------------
# 5. Composite URI
# ---------------------------------------------------------------------------
def compute_uri(D_hw_hat, R_cloud_hat, Q_edge_hat, alpha, beta, gamma):
    """
    Computes the Unified Risk Index as a weighted sum of the three sub-indices.

    URI(t) = alpha * D_hw_hat + beta * R_cloud_hat + gamma * Q_edge_hat

    Parameters
    ----------
    D_hw_hat : float
        Hardware depreciation risk, [0, 1].
    R_cloud_hat : float
        Cloud cost / eviction risk, [0, 1].
    Q_edge_hat : float
        Queue urgency, [0, 1].
    alpha, beta, gamma : float
        Dynamic weights (should sum to 1).

    Returns
    -------
    float
        URI value, range [0, 1].
    """
    return alpha * D_hw_hat + beta * R_cloud_hat + gamma * Q_edge_hat


# ---------------------------------------------------------------------------
# 6. Offload Decision
# ---------------------------------------------------------------------------
def should_offload(uri_value, uri_threshold):
    """
    Binary decision: offload to cloud if URI exceeds the configured threshold.

    Parameters
    ----------
    uri_value : float
        Current URI score, [0, 1].
    uri_threshold : float
        Decision boundary, [0, 1].

    Returns
    -------
    bool
        True if workload should be offloaded to the cloud.
    """
    return uri_value >= uri_threshold


# ---------------------------------------------------------------------------
# Internal Helpers
# ---------------------------------------------------------------------------
def _sigmoid(x, k, midpoint):
    """Standard logistic sigmoid: 1 / (1 + exp(-k * (x - midpoint)))."""
    z = -k * (x - midpoint)
    try:
        return 1.0 / (1.0 + math.exp(z))
    except OverflowError:
        return 0.0 if z > 0 else 1.0
