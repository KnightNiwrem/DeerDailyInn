const normalizeItemName = (itemName: string) => itemName
  .replace(/[^\x00-\x7F]/g, '')
  .trim()
  .toLowerCase();

export { normalizeItemName };
