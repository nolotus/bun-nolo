import { formatISO } from "date-fns"; // 假设您使用 date-fns 来处理日期

export const createPageData = (pageState, userId: string) => {
  const nowISO = formatISO(new Date()); // 获取并格式化当前时间
  return {
    content: pageState.content,
    title: pageState.meta.title,
    creator: userId,
    created_at: pageState.createdTime || nowISO, // 如果存在createdTime，使用它，否则使用当前时间
    type: pageState.meta.type,
    lat: pageState.meta.lat,
    lng: pageState.meta.lng,
    layout: pageState.meta.layout,
    is_template: pageState.saveAsTemplate,
    categories: pageState.meta.categories,
    tags: pageState.meta.tags,
    end_time: pageState.meta.end_time,
  };
};
