# test_spot_price_feed.py

"""
Unit and Integration Tests for spot_price_feed.py
==================================================
Tests AWS signal fetchers with mocked boto3 calls to ensure CI passes
without requiring live AWS credentials.
"""

import unittest
from unittest.mock import MagicMock, patch
from spot_price_feed import (
    fetch_spot_price_history,
    fetch_placement_score,
    fetch_interruption_frequency,
)


class TestSpotPriceFeedMocked(unittest.TestCase):
    """Tests AWS signal fetchers using unittest.mock."""

    def setUp(self):
        from spot_price_feed import _SPOT_PRICE_CACHE, _PLACEMENT_SCORE_CACHE, _SPOT_ADVISOR_CACHE
        _SPOT_PRICE_CACHE['last_updated'] = 0
        _PLACEMENT_SCORE_CACHE['last_updated'] = 0
        _SPOT_ADVISOR_CACHE['last_updated'] = 0

    @patch('boto3.client')
    def test_fetch_spot_price_history_success(self, mock_boto_client):
        """Tests successful describe_spot_price_history response."""
        mock_ec2 = MagicMock()
        mock_boto_client.return_value = mock_ec2
        mock_ec2.describe_spot_price_history.return_value = {
            'SpotPriceHistory': [
                {'SpotPrice': '0.0116', 'Timestamp': '2026-08-01T10:00:00Z'},
                {'SpotPrice': '0.0120', 'Timestamp': '2026-08-01T10:05:00Z'},
                {'SpotPrice': '0.0118', 'Timestamp': '2026-08-01T10:10:00Z'},
            ]
        }

        prices, status = fetch_spot_price_history(instance_type="t2.micro", region="us-east-1")
        self.assertEqual(len(prices), 3)
        self.assertEqual(prices[-1], 0.0118)
        self.assertIn("AWS_API_SUCCESS", status)

    @patch('boto3.client')
    def test_fetch_placement_score_success(self, mock_boto_client):
        """Tests successful get_spot_placement_scores response."""
        mock_ec2 = MagicMock()
        mock_boto_client.return_value = mock_ec2
        mock_ec2.get_spot_placement_scores.return_value = {
            'SpotPlacementScores': [
                {'Score': 9, 'SingleAvailabilityZone': True}
            ]
        }

        score, status = fetch_placement_score(instance_types=["t2.micro"], region="us-east-1", force_refresh=True)
        self.assertEqual(score, 0.9)  # 9/10 normalized
        self.assertIn("AWS_API_SUCCESS", status)

    @patch('boto3.client')
    def test_fetch_placement_score_iam_fallback(self, mock_boto_client):
        """Tests graceful fallback when get_spot_placement_scores raises UnauthorizedOperation."""
        from botocore.exceptions import ClientError
        mock_ec2 = MagicMock()
        mock_boto_client.return_value = mock_ec2
        mock_ec2.get_spot_placement_scores.side_effect = ClientError(
            {'Error': {'Code': 'UnauthorizedOperation', 'Message': 'You are not authorized to perform this operation.'}},
            'GetSpotPlacementScores'
        )

        score, status = fetch_placement_score(instance_types=["t2.micro"], region="us-east-1", force_refresh=True)
        self.assertGreaterEqual(score, 0.0)
        self.assertLessEqual(score, 1.0)
        self.assertIn("FALLBACK", status)

    def test_fetch_interruption_frequency(self):
        """Tests interruption frequency mapping and fallback."""
        val, bucket, status = fetch_interruption_frequency(instance_type="t2.micro", region="us-east-1")
        self.assertGreaterEqual(val, 0.0)
        self.assertLessEqual(val, 1.0)
        self.assertIsInstance(bucket, str)


if __name__ == "__main__":
    unittest.main()