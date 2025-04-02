// 文件路径: src/hooks/useGroupedContent.ts (或你的实际路径)

import React, { useMemo } from "react";
// 确保导入更新后的类型
import {
  SpaceData,
  Categories,
  Contents,
  SpaceContent,
  Category,
} from "create/space/types"; // 确认路径
// 可能需要导入 UNCATEGORIZED_ID，但在此步骤的修改中非必需
// import { UNCATEGORIZED_ID } from "create/space/constants";

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

// --- 辅助函数 (核心修改: isItemCategorized) ---

// filterAndSortContentItems (保持不变, 仍按 updatedAt 排序)
function filterAndSortContentItems(
  contents: Contents | null | undefined
): SpaceContent[] {
  if (!contents) {
    return [];
  }
  return Object.values(contents)
    .filter((item): item is SpaceContent => item !== null) // 过滤 null (已删除)
    .sort((a, b) => b.updatedAt - a.updatedAt); // 按更新时间降序
}

// getValidCategoriesMap (保持不变, 仍获取非 null 的分类定义)
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
      categories[categoryId] !== null // 确保分类定义存在且未被标记为删除 (null)
    ) {
      validCategories[categoryId] = categories[categoryId] as Category;
    }
  }
  return validCategories;
}

/**
 * 检查内容项是否属于一个有效的、已知的分类 (兼容旧数据 "")
 * @param item - 内容项
 * @param validCategoriesMap - 只包含有效 Category 的映射
 * @returns 如果内容项已分类且分类有效，则返回 true，否则返回 false
 */
function isItemCategorized(
  item: SpaceContent,
  validCategoriesMap: Record<string, Category>
): boolean {
  // --- 核心修改 ---
  // 一个项目被视为“已分类”需要满足以下所有条件：
  // 1. 它必须 *拥有* categoryId 属性 (即 item.categoryId 不是 undefined)。
  // 2. 它的 categoryId *不能是* 空字符串 "" (兼容旧数据的未分类标记)。
  // 3. 它的 categoryId 必须是当前有效分类映射中的一个键 (确保分类存在且未被删除)。
  return (
    item.categoryId !== undefined &&
    item.categoryId !== "" && // <--- 兼容性检查：排除旧的空字符串标记
    validCategoriesMap.hasOwnProperty(item.categoryId)
  );
}

/**
 * 将排序后的内容项分组为已分类和未分类
 * (基于修改后的 isItemCategorized，此函数逻辑无需改变)
 * @param sortedContent - 已排序的内容项数组
 * @param validCategoriesMap - 只包含有效 Category 的映射
 * @returns 分组后的内容对象
 */
function groupContentItems(
  sortedContent: SpaceContent[],
  validCategoriesMap: Record<string, Category>
): GroupedContentResult["groupedData"] {
  const categorized: Record<string, SpaceContent[]> = {};
  const uncategorized: SpaceContent[] = [];

  // 初始化 categorized 对象，为每个有效分类创建一个空数组
  Object.keys(validCategoriesMap).forEach((categoryId) => {
    categorized[categoryId] = [];
  });

  sortedContent.forEach((item) => {
    // 使用更新后的 isItemCategorized 判断
    if (isItemCategorized(item, validCategoriesMap)) {
      // item.categoryId 此时非空、非 "" 且是 validCategoriesMap 的有效 key
      // 使用非空断言，因为 isItemCategorized 保证了其存在
      categorized[item.categoryId!].push(item);
    } else {
      // 包括 categoryId === undefined, categoryId === "",
      // 或 categoryId 指向无效/已删除分类的情况
      uncategorized.push(item);
    }
  });

  return { categorized, uncategorized };
}

// sortValidCategories (保持不变, 仍对有效分类按 order 排序)
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

// --- 主 Hook (保持不变) ---
const DEFAULT_RESULT: GroupedContentResult = {
  groupedData: { categorized: {}, uncategorized: [] },
  sortedCategories: [],
};

export const useGroupedContent = (
  space: SpaceData | null
): GroupedContentResult => {
  return useMemo((): GroupedContentResult => {
    // 处理 space 不存在的情况
    if (!space) {
      return DEFAULT_RESULT;
    }
    // 安全地获取 contents 和 categories
    const rawContents = space.contents;
    const rawCategories = space.categories;

    // 1. 过滤并排序内容项
    const sortedContent = filterAndSortContentItems(rawContents);
    // 2. 提取有效的分类定义
    const validCategoriesMap = getValidCategoriesMap(rawCategories);
    // 3. 对内容进行分组 (使用更新后的 isItemCategorized)
    const groupedData = groupContentItems(sortedContent, validCategoriesMap);
    // 4. 对有效分类进行排序
    const sortedCategories = sortValidCategories(validCategoriesMap);

    return { groupedData, sortedCategories };
  }, [space]); // 依赖项仍然是 space 对象本身
};
