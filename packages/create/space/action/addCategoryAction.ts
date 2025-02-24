import type { SpaceId, SpaceData } from "create/space/types";
import { selectCurrentUserId } from "auth/authSlice";
import { createSpaceKey } from "create/space/spaceKeys";
import { read, write } from "database/dbSlice";
import { ulid } from "ulid";
import { selectCurrentSpaceId } from "../spaceSlice";

/**
 * 添加分类到空间
 *
 * 说明：
 * 1. 当前用户必须为该空间成员，才有权限添加分类。
 * 2. 若传入的分类 ID 已存在，则报错；如果未传入分类 ID，则自动生成唯一的分类 ID。
 * 3. 分类的 order 默认取当前分类数量，也可以手动指定。
 * 4. 更新空间数据时会更新 updatedAt 字段，并返回最新的空间数据。
 */
export const addCategoryAction = async (
  input: {
    name: string;
  },
  thunkAPI: any
): Promise<{ spaceId: SpaceId; updatedSpaceData: SpaceData }> => {
  const { name } = input;
  const state = thunkAPI.getState();
  const spaceId = selectCurrentSpaceId(state);
  const categoryId = ulid();
  const { dispatch, getState } = thunkAPI;
  const currentUserId = selectCurrentUserId(state);
  const order = 0;

  // 生成空间 key
  const spaceKey = createSpaceKey.space(spaceId);

  // 读取空间数据
  const spaceData: SpaceData | null = await dispatch(read(spaceKey)).unwrap();

  if (!spaceData) {
    throw new Error("空间不存在");
  }

  // 验证当前用户是否为该空间成员
  if (!spaceData.members.includes(currentUserId)) {
    throw new Error("当前用户不是空间成员，无法添加分类");
  }

  // 自动生成分类 ID（如果未传入）
  const newCategoryId: string = categoryId || `cat-${Date.now()}`;

  if (spaceData.categories && spaceData.categories[newCategoryId]) {
    throw new Error("该分类已存在");
  }

  // 生成新的分类列表
  const newCategories = spaceData.categories ? { ...spaceData.categories } : {};
  newCategories[newCategoryId] = {
    name,
    order: order !== undefined ? order : Object.keys(newCategories).length,
  };

  // 更新空间数据
  const updatedSpaceData: SpaceData = {
    ...spaceData,
    categories: newCategories,
    updatedAt: Date.now(),
  };

  // 写入更新后的数据
  await dispatch(
    write({ data: updatedSpaceData, customKey: spaceKey })
  ).unwrap();

  return { spaceId, updatedSpaceData };
};
