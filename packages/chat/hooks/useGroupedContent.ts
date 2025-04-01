import React, { useMemo } from "react";
import { SpaceContent, SpaceData } from "create/space/types";
interface GroupedContent {
  categorized: Record<string, SpaceContent[]>;
  uncategorized: SpaceContent[];
}

interface CategoryItem {
  id: string;
  name: string;
  order?: number;
}

export const useGroupedContent = (space: SpaceData | null) => {
  return useMemo(() => {
    if (!space) {
      return {
        groupedData: { categorized: {}, uncategorized: [] } as GroupedContent,
        sortedCategories: [] as CategoryItem[],
      };
    }
    console.log("space", space);
    const { contents, categories } = space;
    const categorized: Record<string, SpaceContent[]> = {};
    const uncategorized: SpaceContent[] = [];

    // Initialize categorized arrays for each category
    if (categories) {
      Object.keys(categories).forEach((categoryId) => {
        categorized[categoryId] = [];
      });
    }

    // Safely process contents
    if (contents) {
      Object.values(contents)
        .filter(
          (item): item is SpaceContent => item !== null && item !== undefined
        ) // Filter out null/undefined items
        .sort((a, b) => {
          // Use a fallback timestamp (e.g., 0) if updatedAt or createdAt is missing
          const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
          const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
          return timeB - timeA; // Sort descending (newest first)
        })
        .forEach((item) => {
          if (categories && item.categoryId && categories[item.categoryId]) {
            categorized[item.categoryId].push(item);
          } else {
            uncategorized.push(item);
          }
        });
    }

    // Sort categories by order
    const sortedCategories = categories
      ? Object.entries(categories)
          .map(([id, category]) => ({
            id,
            ...category,
          }))
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      : [];

    return { groupedData: { categorized, uncategorized }, sortedCategories };
  }, [space]);
};
