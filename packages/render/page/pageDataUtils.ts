export const createPageData = (pageState, userId: string) => ({
  content: pageState.content,
  title: pageState.meta.title,
  has_version: pageState.hasVersion,
  creator: userId,
  created_at: pageState.createdTime,
  mdast: pageState.mdast,
  type: pageState.meta.type,
  lat: pageState.meta.lat,
  lng: pageState.meta.lng,
});
