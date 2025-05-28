// 文件路径: src/hooks/useGroupedContent.ts
import React, { useMemo } from "react";
import {
  SpaceData,
  Categories,
  Contents,
  SpaceContent,
  Category,
} from "create/space/types";

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

function filterAndSortContentItems(
  contents: Contents | null | undefined
): SpaceContent[] {
  if (!contents) return [];
  return Object.values(contents)
    .filter((item): item is SpaceContent => item !== null)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

function getValidCategoriesMap(
  categories: Categories | null | undefined
): Record<string, Category> {
  const validCategoriesMap: Record<string, Category> = {};
  if (!categories) return validCategoriesMap;
  for (const categoryId in categories) {
    if (
      Object.prototype.hasOwnProperty.call(categories, categoryId) &&
      categories[categoryId] !== null
    ) {
      validCategoriesMap[categoryId] = categories[categoryId] as Category;
    }
  }
  return validCategoriesMap;
}

function isItemCategorized(
  item: SpaceContent,
  validCategoriesMap: Record<string, Category>
): boolean {
  return (
    item.categoryId !== undefined &&
    item.categoryId !== "" &&
    validCategoriesMap.hasOwnProperty(item.categoryId)
  );
}

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
    if (isItemCategorized(item, validCategoriesMap)) {
      categorized[item.categoryId!].push(item); // 使用 push 替代 unshift
    } else {
      uncategorized.push(item); // 使用 push 替代 unshift
    }
  });
  // 反转数组以保持最新在前
  Object.values(categorized).forEach((arr) => arr.reverse());
  uncategorized.reverse();
  return { categorized, uncategorized };
}

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

const DEFAULT_RESULT: GroupedContentResult = {
  groupedData: { categorized: {}, uncategorized: [] },
  sortedCategories: [],
};

export const useGroupedContent = (
  space: SpaceData | null
): GroupedContentResult => {
  return useMemo((): GroupedContentResult => {
    if (!space) return DEFAULT_RESULT;
    const rawContents = space.contents;
    const rawCategories = space.categories;
    const sortedContent = filterAndSortContentItems(rawContents);
    const validCategoriesMap = getValidCategoriesMap(rawCategories);
    const groupedData = groupContentItems(sortedContent, validCategoriesMap);
    const sortedCategories = sortValidCategories(validCategoriesMap);
    return { groupedData, sortedCategories };
  }, [space]); // 依赖 space 对象
};
