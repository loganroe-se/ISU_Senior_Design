import requests

BASE_URL = "https://api.dripdropco.com"

# Integration test user and post information
USER_ID = 7
POST_ID = 66  
like_data = {"userId": USER_ID, "postId": POST_ID}


def test_like_post():
    like_response = requests.post(f"{BASE_URL}/like", json=like_data)
    assert like_response.status_code == 201
    assert f"User {USER_ID} liked post {POST_ID}" in like_response.text

def test_like_duplicate():
    like_response = requests.post(f"{BASE_URL}/like", json=like_data)
    assert like_response.status_code == 409  # Conflict due to duplicate like

def test_like_missing_fields():
    like_data = {"userId": USER_ID}  # Missing postId
    like_response = requests.post(f"{BASE_URL}/like", json=like_data)
    assert like_response.status_code == 400  # Bad request due to missing fields

def test_unlike_post():
    unlike_response = requests.delete(f"{BASE_URL}/like", json=like_data)
    assert unlike_response.status_code == 200
    assert "Like was removed successfully" in unlike_response.text

def test_unlike_nonexistent():
    unlike_response = requests.delete(f"{BASE_URL}/like", json=like_data)
    assert unlike_response.status_code == 404  # Not found since like doesn't exist anymore

def test_unlike_missing_fields():
    unlike_data = {"userId": USER_ID}  # Missing postId
    unlike_response = requests.delete(f"{BASE_URL}/like", json=unlike_data)
    assert unlike_response.status_code == 400  # Bad request due to missing fields

def test_like_invalid_user_or_post():
    invalid_data = {"userId": 99999, "postId": 99999}  # Nonexistent user and post

    like_response = requests.post(f"{BASE_URL}/like", json=invalid_data)
    assert like_response.status_code == 404  # Not found since user/post doesn't exist
