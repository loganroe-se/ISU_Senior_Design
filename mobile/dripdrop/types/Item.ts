// types/Item.ts
export type Item = {
  clothingItemID: number; 
  name: string;
  brand: string;
  category: string;
  price: number;
  itemURL: string;
  size: string;
  isApproved?: boolean;
};
