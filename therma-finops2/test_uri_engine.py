# test_uri_engine.py
"""
Unit tests for the URI engine functions.
At least one nominal + one edge case per function.
Run with:  python -m pytest test_uri_engine.py -v
       or: python -m unittest test_uri_engine -v
"""

import unittest
import math
from uri_engine import (
    hardware_depreciation,
    cloud_risk,
    queue_urgency,
    dynamic_weights,
    compute_uri,
    should_offload,
    _sigmoid,
)

# Shared constants matching uri_config defaults
K_B = 8.617e-5
T_REF = 318.15   # 45 °C
T_CRIT = 358.15  # 85 °C


class TestHardwareDepreciation(unittest.TestCase):
    """Tests for hardware_depreciation()."""

    def _call(self, T_j=330.0, delta_T=10.0):
        """Helper with default args matching uri_config defaults."""
        return hardware_depreciation(
            T_j=T_j, T_ref=T_REF, E_a=0.7, k_b=K_B,
            delta_T=delta_T, n=2.0, C=1e4, L0=50000.0, f_cyc=1.0,
            w1=0.6, w2=0.4, k_D=10.0, D_mid=0.5
        )

    def test_nominal_moderate_temp(self):
        """At a moderate temp above T_ref, depreciation should be in (0, 1)."""
        result = self._call(T_j=340.0, delta_T=15.0)
        self.assertGreater(result, 0.0)
        self.assertLess(result, 1.0)

    def test_at_reference_temp(self):
        """At T_ref with zero swing, depreciation should be low (near sigmoid(0-D_mid))."""
        result = self._call(T_j=T_REF, delta_T=0.0)
        # AF = 1.0, arrhenius_norm ≈ 0, cyclic_damage = 0 → raw ≈ 0 → sigmoid(-k*D_mid)
        self.assertLess(result, 0.1)

    def test_at_critical_temp(self):
        """At T_crit with large swing, depreciation should be high."""
        result = self._call(T_j=T_CRIT, delta_T=40.0)
        self.assertGreater(result, 0.5)

    def test_extreme_temp(self):
        """Far above T_crit, result should be high (> 0.8)."""
        result = self._call(T_j=400.0, delta_T=50.0)
        self.assertGreater(result, 0.8)

    def test_output_range(self):
        """Output must always be in [0, 1]."""
        for T_j in [T_REF, 330, 350, T_CRIT, 400, 500]:
            for delta_T in [0, 5, 20, 50]:
                result = self._call(T_j=T_j, delta_T=delta_T)
                self.assertGreaterEqual(result, 0.0)
                self.assertLessEqual(result, 1.0)


class TestCloudRisk(unittest.TestCase):
    """Tests for cloud_risk()."""

    def _call(self, P_spot_history=None, p_evict=0.05):
        if P_spot_history is None:
            P_spot_history = [0.04, 0.042, 0.038, 0.041, 0.039]
        result, sigma = cloud_risk(
            P_spot_history=P_spot_history,
            p_evict=p_evict, C_penalty=0.10, C_migrate=0.05,
            L_reexec=0.08, lambda_cost=1.0, P_ref=0.04,
            C_ref=0.25, mu1=0.5, mu2=0.5, k_R=10.0,
            R_mid=0.5, window_W=5
        )
        return result, sigma

    def test_nominal(self):
        """With typical prices and low eviction, risk should be moderate-low."""
        result, _ = self._call()
        self.assertGreater(result, 0.0)
        self.assertLess(result, 1.0)

    def test_empty_price_history(self):
        """With no price data, volatility = 0 — should not crash."""
        result, sigma = self._call(P_spot_history=[])
        self.assertEqual(sigma, 0.0)
        self.assertGreaterEqual(result, 0.0)

    def test_single_price(self):
        """Single price observation — stdev undefined, volatility = 0."""
        result, sigma = self._call(P_spot_history=[0.04])
        self.assertEqual(sigma, 0.0)

    def test_zero_eviction(self):
        """With p_evict=0, only volatility component contributes."""
        result, _ = self._call(p_evict=0.0)
        self.assertGreaterEqual(result, 0.0)

    def test_high_eviction(self):
        """High eviction probability should increase risk."""
        low_result, _ = self._call(p_evict=0.05)
        high_result, _ = self._call(p_evict=0.90)
        self.assertGreater(high_result, low_result)

    def test_output_range(self):
        """Output must always be in [0, 1]."""
        for p in [0.0, 0.1, 0.5, 1.0]:
            result, _ = self._call(p_evict=p)
            self.assertGreaterEqual(result, 0.0)
            self.assertLessEqual(result, 1.0)


class TestQueueUrgency(unittest.TestCase):
    """Tests for queue_urgency()."""

    def _call(self, queue_depth=5, deadline_remaining=60.0, task_complexity=5.0):
        return queue_urgency(
            queue_depth=queue_depth, q_max=10.0,
            deadline_remaining=deadline_remaining,
            task_complexity=task_complexity,
            c_max=10.0, nu1=0.4, nu2=0.35, nu3=0.25, epsilon=1e-3
        )

    def test_nominal(self):
        """Mid-queue, mid-deadline, mid-complexity → moderate urgency."""
        result = self._call()
        self.assertGreater(result, 0.0)
        self.assertLess(result, 1.0)

    def test_empty_queue(self):
        """Empty queue with plenty of time → very low urgency."""
        result = self._call(queue_depth=0, deadline_remaining=1000.0, task_complexity=0.0)
        self.assertLess(result, 0.1)

    def test_deadline_passed(self):
        """Deadline already passed (remaining ≤ 0) → deadline pressure = 1.0."""
        result = self._call(deadline_remaining=0.0)
        self.assertGreater(result, 0.5)

    def test_negative_deadline(self):
        """Negative deadline should be treated as passed."""
        result = self._call(deadline_remaining=-10.0)
        self.assertGreater(result, 0.5)

    def test_full_queue_max_urgency(self):
        """Full queue + expired deadline + max complexity → near 1.0."""
        result = self._call(queue_depth=10, deadline_remaining=0.0, task_complexity=10.0)
        self.assertGreater(result, 0.9)

    def test_output_range(self):
        """Output must be clamped to [0, 1]."""
        for q in [0, 5, 10, 20]:
            for d in [-5, 0, 30, 1000]:
                result = self._call(queue_depth=q, deadline_remaining=d)
                self.assertGreaterEqual(result, 0.0)
                self.assertLessEqual(result, 1.0)


class TestDynamicWeights(unittest.TestCase):
    """Tests for dynamic_weights()."""

    def _call(self, T_j=330.0, sigma_P=0.005):
        return dynamic_weights(
            T_j=T_j, T_crit=T_CRIT, sigma_P=sigma_P,
            sigma_P_bar=0.01, alpha0=0.33, alpha_max=0.70,
            beta0=0.33, beta_max=0.50, p_exp=2.0,
            kappa=2.0, gamma_min=0.10
        )

    def test_simplex_constraint(self):
        """Weights must always sum to 1.0."""
        for T in [300, 320, 340, T_CRIT, 370]:
            for s in [0.0, 0.005, 0.01, 0.05]:
                alpha, beta, gamma = self._call(T_j=T, sigma_P=s)
                self.assertAlmostEqual(alpha + beta + gamma, 1.0, places=6)

    def test_gamma_floor(self):
        """Gamma must never drop below gamma_min (after normalization, 
        the proportion should still reflect the floor)."""
        alpha, beta, gamma = self._call()
        self.assertGreater(gamma, 0.0)

    def test_alpha_escalates_near_tcrit(self):
        """Alpha should be higher when T_j is near T_crit than when cool."""
        _, _, _ = self._call(T_j=300.0)
        alpha_cool, _, _ = self._call(T_j=300.0)
        alpha_hot, _, _ = self._call(T_j=T_CRIT - 1)
        self.assertGreater(alpha_hot, alpha_cool)

    def test_beta_escalates_with_volatility(self):
        """Beta should increase with higher spot-price volatility."""
        _, beta_low, _ = self._call(sigma_P=0.001)
        _, beta_high, _ = self._call(sigma_P=0.05)
        self.assertGreater(beta_high, beta_low)

    def test_all_positive(self):
        """All weights must be non-negative."""
        alpha, beta, gamma = self._call()
        self.assertGreaterEqual(alpha, 0.0)
        self.assertGreaterEqual(beta, 0.0)
        self.assertGreaterEqual(gamma, 0.0)


class TestComputeURI(unittest.TestCase):
    """Tests for compute_uri()."""

    def test_basic_weighted_sum(self):
        """URI should equal the weighted sum of sub-indices."""
        result = compute_uri(0.8, 0.3, 0.5, alpha=0.5, beta=0.3, gamma=0.2)
        expected = 0.5 * 0.8 + 0.3 * 0.3 + 0.2 * 0.5
        self.assertAlmostEqual(result, expected, places=6)

    def test_all_zero(self):
        """All-zero inputs → URI = 0."""
        result = compute_uri(0.0, 0.0, 0.0, 0.33, 0.33, 0.34)
        self.assertAlmostEqual(result, 0.0, places=6)

    def test_all_max(self):
        """All sub-indices at 1.0 with equal weights → URI = 1.0."""
        result = compute_uri(1.0, 1.0, 1.0, 1/3, 1/3, 1/3)
        self.assertAlmostEqual(result, 1.0, places=6)


class TestShouldOffload(unittest.TestCase):
    """Tests for should_offload()."""

    def test_above_threshold(self):
        self.assertTrue(should_offload(0.6, 0.55))

    def test_at_threshold(self):
        self.assertTrue(should_offload(0.55, 0.55))

    def test_below_threshold(self):
        self.assertFalse(should_offload(0.3, 0.55))

    def test_boundary(self):
        self.assertFalse(should_offload(0.5499, 0.55))


class TestSigmoid(unittest.TestCase):
    """Tests for the internal _sigmoid helper."""

    def test_midpoint(self):
        """At x = midpoint, sigmoid should return 0.5."""
        self.assertAlmostEqual(_sigmoid(0.5, k=10.0, midpoint=0.5), 0.5, places=6)

    def test_large_positive(self):
        """Far above midpoint → close to 1."""
        self.assertGreater(_sigmoid(10.0, k=10.0, midpoint=0.5), 0.99)

    def test_large_negative(self):
        """Far below midpoint → close to 0."""
        self.assertLess(_sigmoid(-10.0, k=10.0, midpoint=0.5), 0.01)


if __name__ == "__main__":
    unittest.main()
