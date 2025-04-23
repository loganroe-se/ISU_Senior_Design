# Test file for user endpoints
# Endpoints tested: createUser, deleteUser, getUserById, getUserByUsername, searchUsers
# Endpoints yet to be added: getUsers, updateUser, userSignIn

# Integration test user information
# userID: 7
# username: "INTEGRATION_TEST_USER"
# email: "test@test.com"
# password: "password"


import requests

BASE_URL = "https://api.dripdropco.com"

#---------------------Create, Delete, and Get User By Username Tests------------------------

def test_create_and_delete_user():
    # Step 1: Create a user
    user_data = {
        "username": "CREATE_TEST_USER",
        "email": "createtest@test.com",
        "password": "password123",
        "dob": "2000-12-12"
    }
    create_response = requests.post(f"{BASE_URL}/users", json=user_data)
    assert create_response.status_code == 201
    
    # Step 2: Get the created user
    username = "CREATE_TEST_USER"
    get_response = requests.get(f"{BASE_URL}/users/username/{username}")
    assert get_response.status_code == 200

    json_data = get_response.json()
    assert json_data["username"] == user_data["username"]
    assert json_data["email"] == user_data["email"]
    assert json_data["dob"] == user_data["dob"]
    assert json_data["profilePic"] == "profilePics/default.jpg"
    assert json_data["accountType"] == "USER_FREE"

    # Step 3: Delete the test user
    delete_response = requests.delete(f"{BASE_URL}/users/{json_data['id']}")  # Use the ID from the get response
    assert delete_response.status_code == 200
    
    # Step 4: Ensure the user is gone
    get_response_after_delete = requests.get(f"{BASE_URL}/users/username/{username}")
    assert get_response_after_delete.status_code == 404

def test_create_user_with_existing_username():
    user_data = {
        "username": "INTEGRATION_TEST_USER",
        "email": "createtest@test.com",
        "password": "password123",
        "dob": "2000-12-12"
    }
    create_response = requests.post(f"{BASE_URL}/users", json=user_data)
    assert create_response.status_code == 409

def test_delete_non_existent_user():
    user_id = 99999  # An ID that does not exist
    delete_response = requests.delete(f"{BASE_URL}/users/{user_id}")  # Use the ID from the get response
    assert delete_response.status_code == 404



#---------------------Get User By Id Tests----------------------

def test_get_user_by_id():
    user_id = 7
    response = requests.get(f"{BASE_URL}/users/{user_id}")
    
    assert response.status_code == 200
    json_data = response.json()

    assert json_data["id"] == 7
    assert json_data["username"] == "INTEGRATION_TEST_USER"
    assert json_data["email"] == "test@test.com"
    assert json_data["profilePic"] == "profilePics/default.jpg"
    assert json_data["dob"] == "2000-12-12"
    assert json_data["accountType"] == "USER_FREE"
    

def test_get_user_by_id_not_found():
    user_id = 99999  # An ID that does not exist
    response = requests.get(f"{BASE_URL}/users/{user_id}")
    assert response.status_code == 404
    

#---------------------Search Users Tests-----------------------

def test_search_users_with_results():
    search_string = "test"  # A search term that should return some results
    
    # Send the GET request to search users
    search_response = requests.get(f"{BASE_URL}/users/search/{search_string}")
    assert search_response.status_code == 200
    
    # Check that the response body is a list of users
    users = search_response.json()
    assert isinstance(users, list), f"Expected list, got {type(users)}"
    
    # Ensure that the search results contain the search term
    for user in users:
        assert search_string.lower() in user['username'].lower(), f"Username '{user['username']}' does not contain the search term"

def test_search_users_no_results():
    search_string = "nonexistentuser"  # A search term that should return no results
    
    # Send the GET request to search users
    search_response = requests.get(f"{BASE_URL}/users/search/{search_string}")
    assert search_response.status_code == 200
    
    # Check that the response body is an empty list
    users = search_response.json()
    assert users == [], f"Expected empty list, got {users}"

def test_search_users_missing_search_string():
    search_response = requests.get(f"{BASE_URL}/users/search/")  # Missing search string
    
    # Expect a 400 error due to missing search string
    assert search_response.status_code == 404

  