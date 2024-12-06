import { formatISO } from "date-fns"; // 假设您使用 date-fns 来处理日期

export const createPageData = (pageState, userId: string) => {
  const nowISO = formatISO(new Date()); // 获取并格式化当前时间
  return {
    content: pageState.content,
    title: pageState.meta.title,
    creator: userId,
    created_at: pageState.createdTime || nowISO, // 如果存在createdTime，使用它，否则使用当前时间
    mdast: pageState.mdast,
    type: pageState.meta.type,
    lat: pageState.meta.lat,
    lng: pageState.meta.lng,
    country: pageState.meta.country,
    state_or_province: pageState.meta.state || pageState.meta.province,
    city_or_county: pageState.meta.city || pageState.meta.country,
    layout: pageState.meta.layout,
    is_template: pageState.saveAsTemplate,
    updated_at: nowISO, // 添加更新时间
    categories: pageState.meta.categories,
    tags: pageState.meta.tags,
    end_time: pageState.meta.end_time,
    price: pageState.meta.price,
    pay_time: pageState.meta.pay_time,
    payment_method: pageState.meta.payment_method,
  };
};
