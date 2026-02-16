import requests
import json
import time

# Configuration
BASE_URL = "http://localhost:8080"
REALM = "Maintenance-DGSI"
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"

# Step 1: Get access token
def get_access_token():
    token_url = f"{BASE_URL}/realms/master/protocol/openid-connect/token"
    data = {
        "grant_type": "password",
        "client_id": "admin-cli",
        "username": ADMIN_USERNAME,
        "password": ADMIN_PASSWORD,
        "scope": "offline_access email profile"
    }
    
    response = requests.post(token_url, data=data)
    if response.status_code == 200:
        return response.json()["access_token"]
    else:
        print(f"Failed to get access token: {response.status_code} - {response.text}")
        return None

# Step 2: Import users
def import_users(access_token):
    users_url = f"{BASE_URL}/admin/realms/{REALM}/users"
    
    # Read users from file
    with open("Maintenance-DGSI-users-0.json", "r") as f:
        user_data = json.load(f)
    
    users = user_data["users"]
    
    print(f"Importing {len(users)} users to realm '{REALM}'...")
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    for i, user in enumerate(users):
        # Remove realm field from user data (not supported by Keycloak API)
        if "realm" in user:
            del user["realm"]
        
        # Print user info
        print(f"  Importing user {i+1}: {user['username']} ({user['email']})")
        
        # Send request to create user
        response = requests.post(users_url, headers=headers, json=user)
        
        if response.status_code == 201:
            print(f"  ✓ Success")
        else:
            print(f"  ✗ Failed: {response.status_code} - {response.text}")
        
        # Add a small delay to avoid rate limiting
        time.sleep(0.5)

if __name__ == "__main__":
    print("Starting user import process...")
    
    # Get access token
    access_token = get_access_token()
    
    if access_token:
        import_users(access_token)
        print("\nUser import completed!")
    else:
        print("Could not get access token. Exiting.")
