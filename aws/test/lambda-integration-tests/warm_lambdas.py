import time
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from cognito import get_cognito_token

ACCESS_TOKEN = get_cognito_token()
headers = {"Authorization": f"Bearer {ACCESS_TOKEN}"}
BASE_URL = "https://api.dripdropco.com"

# Define all endpoints with fake path params where needed
ENDPOINTS = [
    ("/items", ["POST"]),
    ("/follow", ["POST", "DELETE"]),
    ("/posts/99999", ["GET", "DELETE"]),
    ("/items/details", ["GET"]),
    ("/hasSeen", ["POST"]),
    ("/users/search/abc", ["GET"]),
    ("/like", ["POST", "DELETE"]),
    ("/comment/99999", ["DELETE"]),
    ("/posts/ai-recommendations/99999", ["GET"]),
    ("/users", ["GET", "POST"]),
    ("/users/abc", ["GET", "PUT"]),
    ("/users/signIn", ["POST"]),
    ("/users/refresh", ["POST"]),
    ("/users/username/testuser", ["GET"]),
    ("/posts", ["GET", "POST"]),
    ("/posts/search/keyword", ["GET"]),
    ("/hasSeen/seenUsers/999999", ["GET"]),
    ("/items/999999", ["POST", "PUT", "DELETE"]),
    ("/items/post/abc", ["GET"]),
    ("/feed/abc", ["GET"]),
    ("/comment/post/abc", ["GET"]),
    ("/posts/user/abc", ["GET"]),
    ("/posts/publish/999999", ["PUT"]),
    ("/confirm", ["POST"]),
    ("/bookmark", ["GET", "POST", "DELETE"]),
    ("/hasSeen/abc/seenPosts", ["GET"]),
    ("/hasSeen/abc/resetSeen", ["DELETE"]),
    ("/follow/abc/followers", ["GET"]),
    ("/follow/abc/following", ["GET"]),
    ("/comment", ["POST"]),
]


DUMMY_PAYLOAD = {"dummy": "data"}
WARM_INTERVAL = 90  # seconds between warmup rounds
MAX_WORKERS = 10    # Adjust based on API limits

def hit_endpoint(path, method):
    url = BASE_URL + path
    try:
        if method == "GET":
            r = requests.get(url, headers=headers)
        elif method == "POST":
            r = requests.post(url, headers=headers, json=DUMMY_PAYLOAD)
        elif method == "PUT":
            r = requests.put(url, headers=headers, json=DUMMY_PAYLOAD)
        elif method == "DELETE":
            r = requests.delete(url, headers=headers, json=DUMMY_PAYLOAD)
        else:
            return f"⚠ Unsupported method {method} for {path}"
        return f"{method} {path}: {r.status_code}"
    except Exception as e:
        return f"❌ Error hitting {method} {path}: {e}"

def warm_all_endpoints(max_rounds=5):
    round_count = 0
    while round_count < max_rounds:
        print(f"🔥 Starting warmup round {round_count + 1} of {max_rounds}...")
        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            futures = [
                executor.submit(hit_endpoint, path, method)
                for path, methods in ENDPOINTS
                for method in methods
            ]
            for future in as_completed(futures):
                print(future.result())
        
        round_count += 1
        print(f"✅ Round {round_count} complete. Sleeping {WARM_INTERVAL} seconds...\n")
        time.sleep(WARM_INTERVAL)
    
    print(f"✅ All {max_rounds} warmup rounds completed.")

if __name__ == "__main__":
    print("Starting the warmup process...")
    warm_all_endpoints(max_rounds=10)  # Limit to 3 rounds (or any other number you prefer)
