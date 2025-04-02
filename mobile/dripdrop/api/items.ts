// api/items.ts
import { Marker } from "@/types/Marker"; // Import the Marker type
import { Item } from "@/types/Item";

// Fetch markers
export const fetchMarkers = async (): Promise<Marker[]> => {
  try {
    const response = await fetch("https://api.dripdropco.com/items/post/1");
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
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching item:", error);
    return null;
  }
};


export const updateItem = async (
  itemId: number,
  itemData: Omit<Item, "id">
): Promise<Item> => {
  try {
    const response = await fetch(`https://api.dripdropco.com/items/${itemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(itemData), // Send just the item data without id
    });

    if (!response.ok) {
      const errorData = await response.json(); // Get more error details
      throw new Error(errorData.message || "Failed to update item");
    }
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
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