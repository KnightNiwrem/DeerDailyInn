const normalizeItemName = (itemName: string) => {
  return itemName.replace(/[^\x00-\x7F]/g, '').trim().toLowerCase();
};

export { normalizeItemName };
