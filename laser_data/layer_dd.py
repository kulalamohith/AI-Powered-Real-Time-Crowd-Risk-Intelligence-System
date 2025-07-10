import requests
import random
import time

# All gates for all locations (matching your seeded data)
selected_gates = [
    # Stadium gates
    {"locationId": "stadium1", "gateId": "G1"},
    {"locationId": "stadium1", "gateId": "G2"},
    {"locationId": "stadium1", "gateId": "G3"},
    {"locationId": "stadium1", "gateId": "G4"},
    # Metro gates
    {"locationId": "metro1", "gateId": "G1"},
    {"locationId": "metro1", "gateId": "G2"},
    {"locationId": "metro1", "gateId": "G3"},
    {"locationId": "metro1", "gateId": "G4"},
    # Mall gates
    {"locationId": "mall1", "gateId": "G1"},
    {"locationId": "mall1", "gateId": "G2"},
    {"locationId": "mall1", "gateId": "G3"},
    {"locationId": "mall1", "gateId": "G4"},
]

API_URL = "http://localhost:5000/api/crowd-data"

def generate_density():
    return round(random.uniform(2.5, 9.8), 2)

def send_data():
    for gate in selected_gates:
        data = {
            "locationId": gate["locationId"],
            "gateId": gate["gateId"],
            "density": generate_density()
        }
        try:
            res = requests.post(API_URL, json=data)
            status = "yes" if res.status_code == 201 else "no"
            print(f"{status} {data}")
        except Exception as e:
            print("Failed to send:", e)

if __name__ == "__main__":
    while True:
        send_data()
        time.sleep(5)
