// api/items.ts
import { Marker } from "@/types/Marker"; // Import the Marker type

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
