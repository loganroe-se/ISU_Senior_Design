import json

# Load the original categories JSON
with open("json/categories.json", "r") as f:
    data = json.load(f)

# Create the category mapping with name and supercategory
category_mapping = {str(item["id"]): {"name": item["name"], "supercategory": item["supercategory"]}
                    for item in data["categories"]}

# Save this mapping to a new file
with open("json/category_mapping.json", "w") as outfile:
    json.dump(category_mapping, outfile, indent=4)

print("Category mapping saved to category_mapping.json")