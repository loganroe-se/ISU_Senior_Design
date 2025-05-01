import json

def handler(event, context):
    print("Raw event received:", event)

    combined = {
        "image_id": None,
        "image_path": None,
        "clothing_items": []
    }

    merged_items = {}

    for entry in event:
        body = json.loads(entry.get("body", "{}"))

        if not combined["image_id"]:
            combined["image_id"] = body.get("image_id")
        if not combined["image_path"]:
            combined["image_path"] = body.get("image_path")

        for item in body.get("clothing_items", []):
            # Create a hashable key ignoring 'attributes'
            item_key = json.dumps({k: v for k, v in item.items() if k != "attributes"}, sort_keys=True)

            if item_key in merged_items:
                # Add any new attributes (prevent duplicates)
                merged_items[item_key]["attributes"].extend(attr for attr in item.get("attributes", []) 
                                                            if attr not in merged_items[item_key]["attributes"])
            else:
                # Clone the item so we don't modify the original input
                merged_items[item_key] = {
                    **item,
                    "attributes": list(item.get("attributes", []))  # ensure it's a new list
                }

    # Final combined list
    combined["clothing_items"] = list(merged_items.values())
    return combined
