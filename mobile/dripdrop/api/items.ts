// api/items.ts
import { Marker } from "@/types/Marker"; // Import the Marker type
import { Item } from "@/types/Item";

// Fetch markers
export const fetchMarkers = async (postID: number): Promise<Marker[]> => {
  try {
    const response = await fetch(`https://api.dripdropco.com/items/post/${postID}`);
    if (!response.ok) {
      throw new Error("Failed to fetch markers");
    }
    const data: Marker[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching markers:", error);
    throw error;
  }
};

// Add a new marker
export const addMarker = async (
  marker: Omit<Marker, "clothingItemID">
): Promise<Marker> => {
  try {
    const response = await fetch("https://api.dripdropco.com/items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(marker),
    });
    if (!response.ok) {
      throw new Error("Failed to add marker");
    }
    const data: Marker = await response.json();
    return data;
  } catch (error) {
    console.error("Error adding marker:", error);
    throw error;
  }
};

// Delete a marker
export const deleteMarker = async (itemId: number): Promise<void> => {
  try {
    const response = await fetch(`https://api.dripdropco.com/items/${itemId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete marker");
    }
  } catch (error) {
    console.error("Error deleting marker:", error);
    throw error;
  }
};


export const getItem = async (itemId: number): Promise<Item | null> => {
  try {
    const response = await fetch(`https://api.dripdropco.com/items/${itemId}`);
    if (!response.ok) {
      // If 404 or other error, return null
      return null;
    }
    const data = await response.json();
    // Verify the response actually contains item data
    return data?.id ? data : null;
  } catch (error) {
    console.error("Error fetching item:", error);
    return null;
  }
};



export const updateItem = async (itemId: number, itemData: any): Promise<Item> => {
    const endpoint = `https://api.dripdropco.com/items/${itemId}`;
    const method = (await getItem(itemId)) ? "PUT" : "POST";
    
    const response = await fetch(method === "PUT" ? endpoint : "https://api.dripdropco.com/items", {
        method,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(itemData),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${method === "PUT" ? "update" : "create"} item`);
    }

    return await response.json();
};

export const createItem = async (
  itemData: Omit<Item, "id"> & {
    image_id: string;
    xCoord: number;
    yCoord: number;
  }
): Promise<Item> => {
  const response = await fetch("https://api.dripdropco.com/items", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(itemData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create item");
  }
  return await response.json();
};