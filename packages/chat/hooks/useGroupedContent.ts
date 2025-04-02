import React, { useMemo } from "react";
import {
  SpaceData,
  Categories,
  Contents,
  SpaceContent,
  Category,
} from "create/space/types"; // 确保路径正确
import { UNCATEGORIZED_ID } from "create/space/constants"; // 导入常量

// --- 辅助类型 (保持不变) ---
interface ProcessedCategoryItem {
  id: string;
  name: string;
  order: number;
  updatedAt: number;
}

interface GroupedContentResult {
  groupedData: {
    categorized: Record<string, SpaceContent[]>;
    uncategorized: SpaceContent[];
  };
  sortedCategories: ProcessedCategoryItem[];
}

// --- 辅助函数 (更新 isItemCategorized) ---

// filterAndSortContentItems (保持不变)
function filterAndSortContentItems(
  contents: Contents | null | undefined
): SpaceContent[] {
  if (!contents) {
    return [];
  }
  return Object.values(contents)
    .filter((item): item is SpaceContent => item !== null)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

// getValidCategoriesMap (保持不变)
function getValidCategoriesMap(
  categories: Categories | null | undefined
): Record<string, Category> {
  const validCategories: Record<string, Category> = {};
  if (!categories) {
    return validCategories;
  }
  for (const categoryId in categories) {
    if (
      Object.prototype.hasOwnProperty.call(categories, categoryId) &&
      categories[categoryId] !== null
    ) {
      validCategories[categoryId] = categories[categoryId] as Category;
    }
  }
  return validCategories;
}

/**
 * 检查内容项是否属于一个有效的、已知的分类 (使用常量)
 * @param item - 内容项
 * @param validCategoriesMap - 只包含有效 Category 的映射
 * @returns 如果内容项已分类且分类有效，则返回 true，否则返回 false
 */
function isItemCategorized(
  item: SpaceContent,
  validCategoriesMap: Record<string, Category>
): boolean {
  // 一个项目被视为“已分类”需要满足两个条件：
  // 1. 它的 categoryId 不是代表“未分类”的常量 ID。
  // 2. 它的 categoryId 必须是当前有效分类映射中的一个键。
  return (
    item.categoryId !== UNCATEGORIZED_ID && // 不等于未分类 ID
    validCategoriesMap.hasOwnProperty(item.categoryId) // 且该 ID 是一个有效分类
  );
}

// groupContentItems (逻辑不变, 但依赖更新后的 isItemCategorized)
function groupContentItems(
  sortedContent: SpaceContent[],
  validCategoriesMap: Record<string, Category>
): GroupedContentResult["groupedData"] {
  const categorized: Record<string, SpaceContent[]> = {};
  const uncategorized: SpaceContent[] = [];

  Object.keys(validCategoriesMap).forEach((categoryId) => {
    categorized[categoryId] = [];
  });

  sortedContent.forEach((item) => {
    // 使用更新后的 isItemCategorized 判断
    if (isItemCategorized(item, validCategoriesMap)) {
      // item.categoryId 此时非空且是 validCategoriesMap 的有效 key
      categorized[item.categoryId].push(item);
    } else {
      // 包括 categoryId === UNCATEGORIZED_ID 或 categoryId 指向无效/已删除分类的情况
      uncategorized.push(item);
    }
  });

  return { categorized, uncategorized };
}

// sortValidCategories (保持不变)
function sortValidCategories(
  validCategoriesMap: Record<string, Category>
): ProcessedCategoryItem[] {
  return Object.entries(validCategoriesMap)
    .map(
      ([id, categoryData]): ProcessedCategoryItem => ({
        id,
        name: categoryData.name,
        order: categoryData.order,
        updatedAt: categoryData.updatedAt,
      })
    )
    .sort((a, b) => a.order - b.order);
}

// --- 主 Hook (保持不变) ---
const DEFAULT_RESULT: GroupedContentResult = {
  groupedData: { categorized: {}, uncategorized: [] },
  sortedCategories: [],
};

export const useGroupedContent = (
  space: SpaceData | null
): GroupedContentResult => {
  return useMemo((): GroupedContentResult => {
    if (!space) {
      return DEFAULT_RESULT;
    }
    const rawContents = space.contents;
    const rawCategories = space.categories;

    const sortedContent = filterAndSortContentItems(rawContents);
    const validCategoriesMap = getValidCategoriesMap(rawCategories);
    const groupedData = groupContentItems(sortedContent, validCategoriesMap);
    const sortedCategories = sortValidCategories(validCategoriesMap);

    return { groupedData, sortedCategories };
  }, [space]);
};
