import numpy as np
import json
from datetime import datetime, timedelta
import math

class LocationFraudDetector:
    def __init__(self):
        self.suspicious_threshold = 0.7
        self.max_speed_kmh = 120  # Max possible speed in Nigeria
        
    def haversine_distance(self, lat1, lon1, lat2, lon2):
        """Calculate distance between two GPS points in km"""
        R = 6371  # Earth's radius in km
        
        lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.asin(math.sqrt(a))
        
        return R * c
    
    def calculate_speed(self, claim1, claim2):
        """Calculate speed between two claims in km/h"""
        distance = self.haversine_distance(
            claim1['lat'], claim1['lng'],
            claim2['lat'], claim2['lng']
        )
        
        time1 = datetime.fromisoformat(claim1['claimedAt'].replace('Z', '+00:00'))
        time2 = datetime.fromisoformat(claim2['claimedAt'].replace('Z', '+00:00'))
        
        hours = abs((time2 - time1).total_seconds() / 3600)
        
        if hours == 0:
            return float('inf')
        
        return distance / hours
    
    def detect_fraud(self, user_claims):
        """Analyze user claims for suspicious patterns"""
        if len(user_claims) < 2:
            return {'fraud_score': 0, 'suspicious': False, 'reasons': []}
        
        claims = sorted(user_claims, key=lambda x: x['claimedAt'])
        reasons = []
        fraud_score = 0
        
        # Check for impossible speeds (teleportation)
        for i in range(1, len(claims)):
            speed = self.calculate_speed(claims[i-1], claims[i])
            
            if speed > self.max_speed_kmh and speed != float('inf'):
                fraud_score += 0.3
                reasons.append(f"Impossible speed: {speed:.0f} km/h between claims")
                
                if speed > self.max_speed_kmh * 2:
                    fraud_score += 0.2
                    reasons.append(f"Extreme teleportation detected")
        
        # Check for same location multiple times in short period
        locations = {}
        for claim in claims:
            key = f"{claim['lat']:.3f},{claim['lng']:.3f}"
            if key not in locations:
                locations[key] = []
            locations[key].append(claim)
        
        for loc, loc_claims in locations.items():
            if len(loc_claims) > 3:
                fraud_score += 0.2
                reasons.append(f"Multiple claims ({len(loc_claims)}) from same location")
        
        # Check for claims at impossible hours (3-4 AM)
        for claim in claims:
            hour = datetime.fromisoformat(claim['claimedAt'].replace('Z', '+00:00')).hour
            if hour >= 2 and hour <= 4:
                fraud_score += 0.1
                reasons.append(f"Suspicious claim time: {hour}:00 AM")
        
        # Normalize score to 0-1
        fraud_score = min(fraud_score, 1.0)
        
        return {
            'fraud_score': round(fraud_score, 2),
            'suspicious': fraud_score > self.suspicious_threshold,
            'reasons': reasons[:3]  # Top 3 reasons
        }
    
    def verify_claim(self, new_claim, user_history):
        """Verify a single new claim against history"""
        all_claims = user_history + [new_claim]
        result = self.detect_fraud(all_claims)
        
        # Add recommendation
        if result['suspicious']:
            result['recommendation'] = 'Manual review required'
            result['auto_approve'] = False
        else:
            result['recommendation'] = 'Auto-approve'
            result['auto_approve'] = True
        
        return result

# Example usage
if __name__ == "__main__":
    detector = LocationFraudDetector()
    
    # Example claims
    sample_claims = [
        {
            'lat': 6.5244,
            'lng': 3.3792,
            'claimedAt': '2024-06-01T10:00:00Z'
        },
        {
            'lat': 6.5245,
            'lng': 3.3793,
            'claimedAt': '2024-06-01T10:05:00Z'
        }
    ]
    
    result = detector.detect_fraud(sample_claims)
    print("Fraud Detection Result:")
    print(json.dumps(result, indent=2))
