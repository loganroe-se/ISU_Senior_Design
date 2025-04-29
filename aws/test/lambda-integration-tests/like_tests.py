import requests
from cognito import get_cognito_token

ACCESS_TOKEN = get_cognito_token()
headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
BASE_URL = "https://api.dripdropco.com"


def test_like_post():
    response = requests.post(
        f"{BASE_URL}/like",
        headers=headers,
        json={"postId": "1"}
    )
    assert response.status_code == 201

def test_like_duplicate():
    response = requests.post(
        f"{BASE_URL}/like",
        headers=headers,
        json={"postId": "1"}
    )
    assert response.status_code == 409

def test_like_missing_fields():
    response = requests.post(
        f"{BASE_URL}/like",
        headers=headers,
        json={}
    )
    assert response.status_code == 400

def test_unlike_post():
    response = requests.delete(
        f"{BASE_URL}/like",
        headers=headers,
        json={"postId": "1"}
    )
    assert response.status_code == 200

def test_unlike_nonexistent():
    response = requests.delete(
        f"{BASE_URL}/like",
        headers=headers,
        json={"postId": "1"}
    )
    assert response.status_code == 404

def test_unlike_missing_fields():
    response = requests.delete(
        f"{BASE_URL}/like",
        headers=headers,
        json={}
    )
    assert response.status_code == 400

def test_like_invalid_post_id():
    response = requests.post(
        f"{BASE_URL}/like",
        headers=headers,
        json={"postId": "99999"}
    )
    assert response.status_code == 404