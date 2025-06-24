// useSpaceData.ts
import { useEffect, useState } from "react";
import { useAppDispatch } from "app/hooks";
import { read } from "database/dbSlice";
import { createSpaceKey } from "create/space/spaceKeys";
import { createUserKey } from "database/keys";
import { MemberRole } from "app/types";
import { SpaceData } from "app/types";

interface Member {
  id: string;
  name: string; // 从 userProfile.nickname 获取，或使用 id 作为默认值
  email: string; // 从 userProfile.email 获取，或默认值
  role: MemberRole;
  joinedAt: string;
  avatar?: string; // 从 userProfile.avatar 获取，或默认值
}

interface SpaceDataWithMembers extends SpaceData {
  members: Member[]; // 重定义 members 为完整数据
}

export const useSpaceData = (spaceId: string) => {
  const dispatch = useAppDispatch();
  const [spaceData, setSpaceData] = useState<SpaceDataWithMembers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSpaceData = async () => {
      try {
        setLoading(true);
        const spaceKey = createSpaceKey.space(spaceId);
        const rawSpaceData: SpaceData = await dispatch(read(spaceKey)).unwrap();

        // 获取所有成员的详细信息
        const memberPromises = rawSpaceData.members.map(async (memberId) => {
          // 获取 SpaceMemberWithSpaceInfo
          const memberKey = createSpaceKey.member(memberId, spaceId);
          const memberData = await dispatch(read(memberKey)).unwrap();

          // 获取 userProfile，添加容错逻辑
          let userProfile;
          try {
            const profileKey = createUserKey.profile(memberId); // 使用 createUserKey
            userProfile = await dispatch(read(profileKey)).unwrap();
          } catch (err) {
            console.warn(`Failed to fetch userProfile for ${memberId}:`, err);
            userProfile = null; // 如果 404，使用默认值
          }

          return {
            id: memberId,
            name: userProfile?.nickname || memberId, // 默认显示 memberId
            email: userProfile?.email || "",
            role: memberData?.role || MemberRole.MEMBER,
            joinedAt: new Date(
              memberData?.joinedAt || Date.now()
            ).toISOString(),
            avatar: userProfile?.avatar || undefined,
          } as Member;
        });

        const members = await Promise.all(memberPromises);
        setSpaceData({ ...rawSpaceData, members });
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpaceData();
  }, [spaceId, dispatch]);

  return { spaceData, loading, error };
};
