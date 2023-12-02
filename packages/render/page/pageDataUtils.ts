import { DataType } from 'create/types';
export const createPageData = (pageState, userId: string) => ({
  content: pageState.content,
  title: pageState.title,
  has_version: pageState.hasVersion,
  creator: userId,
  created_at: pageState.createdTime,
  mdast: pageState.mdast,
  type: pageState.type || DataType.Page,
});
