// 文件路径: src/hooks/useGroupedContent.ts (或你的实际路径)

import React, { useMemo } from "react";
import {
  SpaceData,
  Categories,
  Contents,
  SpaceContent,
  Category,
} from "create/space/types"; // 确认路径

// --- 辅助类型 ---
interface ProcessedCategoryItem {
  id: string;
  name: string;
  order: number;
  updatedAt: number; // 保留 updatedAt 用于可能的未来排序或调试
}

interface GroupedContentResult {
  groupedData: {
    categorized: Record<string, SpaceContent[]>;
    uncategorized: SpaceContent[];
  };
  sortedCategories: ProcessedCategoryItem[]; // 分类本身的排序列表
}

// --- 辅助函数 ---

/**
 * 过滤掉 null (已删除) 的内容项，并按更新时间降序排序 (最新在前)
 * @param contents - 原始 contents 对象
 * @returns 排序后的 SpaceContent 数组
 */
function filterAndSortContentItems(
  contents: Contents | null | undefined
): SpaceContent[] {
  if (!contents) {
    return [];
  }
  return Object.values(contents)
    .filter((item): item is SpaceContent => item !== null)
    .sort((a, b) => b.updatedAt - a.updatedAt); // 按更新时间降序 (最新在前)
}

/**
 * 从原始 categories 对象中提取有效 (非 null) 的分类定义
 * @param categories - 原始 categories 对象
 * @returns 只包含有效 Category 的映射
 */
function getValidCategoriesMap(
  categories: Categories | null | undefined
): Record<string, Category> {
  const validCategoriesMap: Record<string, Category> = {};
  if (!categories) {
    return validCategoriesMap;
  }
  for (const categoryId in categories) {
    if (
      Object.prototype.hasOwnProperty.call(categories, categoryId) &&
      categories[categoryId] !== null // 确保分类定义存在且未被标记为删除
    ) {
      validCategoriesMap[categoryId] = categories[categoryId] as Category;
    }
  }
  return validCategoriesMap;
}

/**
 * 检查内容项是否属于一个有效的、已知的分类 (兼容旧数据 "")
 * @param item - 内容项
 * @param validCategoriesMap - 只包含有效 Category 的映射
 * @returns 如果内容项已分类且分类有效，则返回 true
 */
function isItemCategorized(
  item: SpaceContent,
  validCategoriesMap: Record<string, Category>
): boolean {
  // 必须有 categoryId，不能是空字符串，且 categoryId 必须在有效分类映射中
  return (
    item.categoryId !== undefined &&
    item.categoryId !== "" &&
    validCategoriesMap.hasOwnProperty(item.categoryId)
  );
}

/**
 * 将已按最新时间排序的内容项分组到已分类和未分类中。
 * 使用 unshift() 来保持每个分组内部也是最新在前。
 * @param sortedContent - 已按 updatedAt 降序排序的内容项数组
 * @param validCategoriesMap - 只包含有效 Category 的映射
 * @returns 分组后的内容对象，每个组内同样是最新在前
 */
function groupContentItems(
  sortedContent: SpaceContent[],
  validCategoriesMap: Record<string, Category>
): GroupedContentResult["groupedData"] {
  const categorized: Record<string, SpaceContent[]> = {};
  const uncategorized: SpaceContent[] = [];

  // 为每个有效分类初始化空数组
  Object.keys(validCategoriesMap).forEach((categoryId) => {
    categorized[categoryId] = [];
  });

  // 遍历已排序内容 (最新在前)
  sortedContent.forEach((item) => {
    if (isItemCategorized(item, validCategoriesMap)) {
      // 使用 unshift 将项添加到对应分类数组的 *开头*
      categorized[item.categoryId!].unshift(item);
    } else {
      // 使用 unshift 将项添加到未分类数组的 *开头*
      uncategorized.unshift(item);
    }
  });

  return { categorized, uncategorized };
}

/**
 * 对有效的分类本身按照它们的 order 属性进行升序排序
 * @param validCategoriesMap - 只包含有效 Category 的映射
 * @returns 按 order 排序的分类信息数组
 */
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
    .sort((a, b) => a.order - b.order); // 按 order 升序
}

// --- 主 Hook ---

// 默认返回值，防止 space 为 null 时出错
const DEFAULT_RESULT: GroupedContentResult = {
  groupedData: { categorized: {}, uncategorized: [] },
  sortedCategories: [],
};

/**
 * 自定义 Hook，用于处理 Space 数据，将其内容分组并排序。
 * @param space - 当前的 SpaceData 对象，或 null
 * @returns 返回包含分组后内容和排序后分类的对象
 */
export const useGroupedContent = (
  space: SpaceData | null
): GroupedContentResult => {
  return useMemo((): GroupedContentResult => {
    // 处理 space 不存在的情况
    if (!space) {
      return DEFAULT_RESULT;
    }
    // 安全地获取原始数据
    const rawContents = space.contents;
    const rawCategories = space.categories;

    // 步骤 1: 过滤无效内容并按更新时间排序 (最新在前)
    const sortedContent = filterAndSortContentItems(rawContents);

    // 步骤 2: 获取有效的分类定义
    const validCategoriesMap = getValidCategoriesMap(rawCategories);

    // 步骤 3: 将排序后的内容分组 (使用 unshift 保持组内最新在前)
    const groupedData = groupContentItems(sortedContent, validCategoriesMap);

    // 步骤 4: 对分类本身进行排序 (按 order)
    const sortedCategories = sortValidCategories(validCategoriesMap);

    // 返回最终处理结果
    return { groupedData, sortedCategories };
  }, [space]); // 依赖项是 space 对象，当 space 变化时重新计算
};
