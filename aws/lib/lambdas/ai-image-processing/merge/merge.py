import json

def handler(event, context):
    print("Raw event received:", event)

    combined = {
        "image_id": None,
        "image_path": None,
        "clothing_items": []
    }

    for entry in event:
        # Parse stringified body
        body = json.loads(entry.get("body", "{}"))
        
        if not combined["image_id"]:
            combined["image_id"] = body.get("image_id")
        if not combined["image_path"]:
            combined["image_path"] = body.get("image_path")

        combined["clothing_items"].extend(body.get("clothing_items", []))

    return combined
