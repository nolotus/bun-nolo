// chat/hooks/useGroupedContents.ts
import { useMemo } from "react";
import { SpaceContent, SpaceData, Category } from "create/space/types";

interface GroupedData {
  categorized: Record<string, SpaceContent[]>;
  uncategorized: SpaceContent[];
}

interface GroupedResult {
  groupedData: GroupedData;
  sortedCategories: (Category & { id: string })[];
}

export const useGroupedContents = (space: SpaceData | null): GroupedResult => {
  return useMemo(() => {
    // 空状态返回
    if (!space) {
      return {
        groupedData: {
          categorized: {},
          uncategorized: [],
        },
        sortedCategories: [],
      };
    }

    const { contents, categories } = space;

    // 初始化分组数据结构
    const categorized: Record<string, SpaceContent[]> = {};
    const uncategorized: SpaceContent[] = [];

    // 初始化所有分类的空数组
    if (categories) {
      Object.keys(categories).forEach((categoryId) => {
        categorized[categoryId] = [];
      });
    }

    // 内容分组和时间排序
    if (contents) {
      Object.values(contents)
        .sort((a, b) => b.updatedAt - a.updatedAt || b.createdAt - a.createdAt)
        .forEach((item) => {
          if (categories && item.categoryId && categories[item.categoryId]) {
            categorized[item.categoryId].push(item);
          } else {
            uncategorized.push(item);
          }
        });
    }

    // 分类排序
    const sortedCategories = Object.entries(categories || {})
      .map(([id, category]) => ({
        id,
        ...category,
      }))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    return {
      groupedData: { categorized, uncategorized },
      sortedCategories,
    };
  }, [space]);
};

// 可以添加一些辅助的类型守卫
export const isValidContent = (content: SpaceContent): boolean => {
  return (
    content &&
    typeof content.contentKey === "string" &&
    typeof content.title === "string" &&
    typeof content.createdAt === "number" &&
    typeof content.updatedAt === "number"
  );
};

// 可以添加一些工具函数
export const getLatestTime = (content: SpaceContent): number => {
  return content.updatedAt || content.createdAt;
};
