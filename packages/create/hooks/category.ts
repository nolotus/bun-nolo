// create/category/useCategories.ts
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { selectUserId } from "auth/authSlice";
import { write } from "database/dbSlice";
import { DataType } from "create/types";

interface Category {
  type: DataType.Category;
  id: string;
  name: string;
  parentId?: string;
  isCollapsed: boolean;
  order: number;
}

interface CategoryConfig {
  data: Category;
  userId: string;
}

interface UseCategoriesResult {
  create: (name: string, parentId?: string) => Promise<Category>;
  toggleCollapse: (id: string) => Promise<Category>;
  isLoading: boolean;
  error: string | null;
}

export const useCategories = (): UseCategoriesResult => {
  const dispatch = useAppDispatch();
  const currentUserId = useAppSelector(selectUserId);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (name: string, parentId?: string): Promise<Category> => {
    setIsLoading(true);
    setError(null);
    try {
      const categoryConfig: CategoryConfig = {
        data: {
          type: DataType.Category,
          name,
          parentId,
          isCollapsed: false,
          order: 0, // You might want to determine this based on existing categories
        },
        userId: currentUserId,
      };
      const result = await dispatch(write(categoryConfig));
      return result.payload;
    } catch (err) {
      setError("Failed to create category");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // const toggleCollapse = async (id: string): Promise<Category> => {
  //   setIsLoading(true);
  //   setError(null);
  //   try {
  //     const category = await getInfo(id);
  //     const result = await dispatch(
  //       patchData({ id, updates: { isCollapsed: !category.isCollapsed } }),
  //     );
  //     return result.payload;
  //   } catch (err) {
  //     setError("Failed to toggle category collapse");
  //     throw err;
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  return {
    create,
    isLoading,
    error,
  };
};
