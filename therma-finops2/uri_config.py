# uri_config.py
"""
Centralized configuration for the Unified Risk Index (URI) engine.
All tunable parameters are loaded from .env with sensible defaults.
No URI constants should be hardcoded elsewhere in the codebase.
"""
import os
from dotenv import load_dotenv

load_dotenv()

# ============================================================
# TRIGGER MODE: "uri" (new URI engine) | "threshold" (legacy)
# ============================================================
TRIGGER_MODE = os.getenv("TRIGGER_MODE", "uri")

# ============================================================
# URI DECISION THRESHOLD
# URI values above this trigger cloud offloading.  Range [0, 1].
# ============================================================
URI_THRESHOLD = float(os.getenv("URI_THRESHOLD", 0.55))

# ============================================================
# HARDWARE DEPRECIATION — Arrhenius + Coffin-Manson Parameters
# ============================================================
# Activation energy for silicon electromigration (eV)
E_A = float(os.getenv("E_A", 0.7))
# Boltzmann constant in eV/K (physical constant, not tunable, but kept here
# for transparency)
K_B = 8.617e-5  # eV/K
# Reference junction temperature (K) — the "safe" baseline
T_REF = float(os.getenv("T_REF", 318.15))  # 45 °C in Kelvin
# Critical junction temperature (K) — thermal throttle / danger zone
T_CRIT = float(os.getenv("T_CRIT", 358.15))  # 85 °C in Kelvin
# Coffin-Manson fatigue exponent (typically 1.5–3 for solder joints)
COFFIN_MANSON_N = float(os.getenv("COFFIN_MANSON_N", 2.0))
# Coffin-Manson material constant
COFFIN_MANSON_C = float(os.getenv("COFFIN_MANSON_C", 1e4))
# Baseline component lifetime in hours at T_REF
L0 = float(os.getenv("L0", 50000.0))
# Thermal cycling frequency (cycles per evaluation window)
F_CYC = float(os.getenv("F_CYC", 1.0))
# Weighting: Arrhenius (steady-state) vs Coffin-Manson (cyclic)
W1 = float(os.getenv("W1", 0.6))
W2 = float(os.getenv("W2", 0.4))
# Sigmoid shaping for D_hw: steepness and midpoint
K_D = float(os.getenv("K_D", 10.0))
D_MID = float(os.getenv("D_MID", 0.5))

# ============================================================
# CLOUD RISK — Spot Price Volatility + Eviction Cost
# ============================================================
# Weight of price volatility component
MU1 = float(os.getenv("MU1", 0.5))
# Weight of eviction-penalty component
MU2 = float(os.getenv("MU2", 0.5))
# Sigmoid shaping for R_cloud: steepness and midpoint
K_R = float(os.getenv("K_R", 10.0))
R_MID = float(os.getenv("R_MID", 0.5))
# Penalty cost ($) if a spot instance is evicted mid-task
C_PENALTY = float(os.getenv("C_PENALTY", 0.10))
# Migration cost ($) to move state to a new instance
C_MIGRATE = float(os.getenv("C_MIGRATE", 0.05))
# Re-execution latency cost ($) for restarting a failed task
L_REEXEC = float(os.getenv("L_REEXEC", 0.08))
# Cost scaling factor for normalization
LAMBDA_COST = float(os.getenv("LAMBDA_COST", 1.0))
# Reference spot price ($) for normalization
P_REF = float(os.getenv("P_REF", 0.04))
# Reference composite cost for normalization
C_REF = float(os.getenv("C_REF", 0.25))
# Rolling window size for spot-price volatility calculation
WINDOW_W = int(os.getenv("WINDOW_W", 5))

# ============================================================
# QUEUE URGENCY — Depth + Deadline + Complexity
# ============================================================
# Weight of queue-depth component
NU1 = float(os.getenv("NU1", 0.4))
# Weight of deadline-pressure component
NU2 = float(os.getenv("NU2", 0.35))
# Weight of task-complexity component
NU3 = float(os.getenv("NU3", 0.25))
# Maximum queue depth for normalization
Q_MAX = float(os.getenv("Q_MAX", 10.0))
# Maximum task complexity score for normalization
C_MAX = float(os.getenv("C_MAX", 10.0))
# Small constant to prevent division by zero in deadline pressure
EPSILON = float(os.getenv("EPSILON", 1e-3))

# ============================================================
# DYNAMIC WEIGHTS — Simplex (alpha + beta + gamma = 1)
# ============================================================
# Baseline weight for hardware depreciation
ALPHA0 = float(os.getenv("ALPHA0", 0.33))
# Maximum weight for hardware depreciation (as T_j → T_crit)
ALPHA_MAX = float(os.getenv("ALPHA_MAX", 0.70))
# Baseline weight for cloud risk
BETA0 = float(os.getenv("BETA0", 0.33))
# Maximum weight for cloud risk (as price volatility rises)
BETA_MAX = float(os.getenv("BETA_MAX", 0.50))
# Power exponent for alpha escalation near T_crit
P_EXP = float(os.getenv("P_EXP", 2.0))
# Scaling factor for beta escalation with volatility
KAPPA = float(os.getenv("KAPPA", 2.0))
# Floor for gamma (queue urgency always gets at least this weight)
GAMMA_MIN = float(os.getenv("GAMMA_MIN", 0.10))
# Mean spot-price standard deviation for normalization
SIGMA_P_BAR = float(os.getenv("SIGMA_P_BAR", 0.01))
