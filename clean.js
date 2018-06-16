async function deleteBadFlashes() {
  const badFlashes = await Flash.query().delete().whereNotIn('item', [...itemNameSet.values()]);
  return badFlashes;
}