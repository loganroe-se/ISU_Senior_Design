import requests
from cognito import get_cognito_token

ACCESS_TOKEN = get_cognito_token()
headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
BASE_URL = "https://api.dripdropco.com"

def test_get_users():
    response = requests.get(f"{BASE_URL}/users", headers=headers)
    assert response.status_code == 200

def test_get_posts():
    response = requests.get(f"{BASE_URL}/posts", headers=headers)
    assert response.status_code == 200


