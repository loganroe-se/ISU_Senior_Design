// api/items.ts
import { Marker } from "@/types/Marker";
import { Item } from "@/types/Item";
import { apiRequest } from "./api";

// Fetch markers
export const fetchMarkers = async (postID: number): Promise<Marker[]> => {
  return apiRequest<Marker[]>("GET", `/items/post/${postID}`);
};

// Add a new marker
export const addMarker = async (
  marker: Omit<Marker, "clothingItemID">
): Promise<Marker> => {
  return apiRequest<Marker>("POST", "/items", marker);
};

// Delete a marker
export const deleteMarker = async (itemId: number): Promise<void> => {
  return apiRequest<void>("DELETE", `/items/${itemId}`);
};

// Get a specific marker
export const getMarker = async (itemId: number): Promise<Marker | null> => {
  try {
    const data = await apiRequest<Marker[] | Marker>(
      "GET",
      `/items/post/${itemId}`
    );
    return Array.isArray(data) ? data[0] : data;
  } catch (error) {
    console.error("Error fetching marker:", error);
    return null;
  }
};

// Get an item
export const getItem = async (itemId: number): Promise<Item | null> => {
  try {
    const data = await apiRequest<Item[] | Item>("GET", `/items/${itemId}`);
    return Array.isArray(data) ? data[0] : data;
  } catch (error) {
    console.error("Error fetching item:", error);
    return null;
  }
};

// Update or create an item
export const updateItem = async (
  itemId: number,
  itemData: any
): Promise<{ itemId: number; message: string }> => {  // Updated return type
  const existing = await getItem(itemId);
  const method = existing ? "PUT" : "POST";
  const endpoint = existing ? `/items/${itemId}` : "/items";

  return apiRequest<{ itemId: number; message: string }>(method, endpoint, itemData);  // Updated generic type
};

// Create an item
export const createItem = async (
  itemData: Omit<Item, "id"> & {
    image_id: string;
    xCoord: number;
    yCoord: number;
  }
): Promise<Item> => {
  return apiRequest<Item>("POST", "/items", itemData);
};
