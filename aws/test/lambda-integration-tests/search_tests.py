import requests
from cognito import get_cognito_token

ACCESS_TOKEN = get_cognito_token()
headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
BASE_URL = "https://api.dripdropco.com"

def test_search_users():
    search_prompt = "test"
    response = requests.get(f"{BASE_URL}/users/search/{search_prompt}", headers=headers)
    assert response.status_code == 200

    users = response.json()
    assert isinstance(users, list), "Response should be a list of users"
    
    for user in users:
        username = user.get("username", "").lower()
        assert search_prompt in username, f"User {user} does not match search term"

def test_search_posts():
    search_prompt = "test"
    response = requests.get(f"{BASE_URL}/posts/search/{search_prompt}", headers=headers)
    assert response.status_code == 200

    posts = response.json()
    assert isinstance(posts, list), "Response should be a list of posts"

    for post in posts:
        caption = post.get("caption", "").lower()
        assert search_prompt in caption, f"Post {post} does not match search term"