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

// Get multiple items
export const getItemDetails = async (itemId: number | number[]): Promise<Item | Item[] | null> => {
  try {
    const ids = Array.isArray(itemId) ? itemId : [itemId];
    const query = `?ids=${ids.join(",")}`;

    const data = await apiRequest<Item[]>("GET", `/items/details${query}`);

    return Array.isArray(itemId) ? data : data[0] || null;
  } catch (error) {
    console.error("Error fetching item:", error);
    return null;
  }
};

//getitems.ts
export const getItem = async (itemId: number): Promise<Item | null> => {
  try {
    const data = await apiRequest<Item[]>("GET", `/items/details?ids=${itemId}`);
    return data[0] || null; // Return first item or null if empty array
  } catch (error) {
    console.error(`Error fetching item ${itemId}:`, error);
    return null;
  }
};


// Update an existing item
export const updateItem = async (
  itemId: number,
  itemData: Partial<Item> & { image_id?: string }
): Promise<{ itemId: number; message: string }> => {
  const existing = await getItem(itemId);
  if (!existing) {
    throw new Error(`Item with ID ${itemId} does not exist for update.`);
  }

  return apiRequest<{ itemId: number; message: string }>(
    "PUT",
    `/items/${itemId}`,
    itemData
  );
};

// Create a new item
export const createItem = async (
  itemData: Omit<Item, "id"> & {
    image_id: string;
    xCoord: number;
    yCoord: number;
  }
): Promise<{ itemId: number; message: string }> => {
  return apiRequest<{ itemId: number; message: string }>(
    "POST",
    "/items",
    itemData
  );
};
