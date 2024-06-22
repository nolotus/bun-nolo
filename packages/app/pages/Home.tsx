import { Link } from "render/ui";
import { nolotusId } from "core/init";

import ChatAIList from "ai/blocks/ChatAIList";
import { useAppSelector, useQueryData } from "app/hooks";
import { DataType } from "create/types";

import {
  LocationIcon,
  PeopleIcon,
  DependabotIcon,
} from "@primer/octicons-react";
import { SpotCard } from "render/components/SpotCard";
import React from "react";
import { selectFilteredDataByUserAndType } from "database/selectors";
import { selectCurrentUserId } from "auth/authSlice";

const Home = () => {
  const userId = useAppSelector(selectCurrentUserId);
  const options = {
    isJSON: true,
    condition: {
      type: DataType.SurfSpot,
    },
    limit: 20,
  };
  const queryConfig = {
    queryUserId: nolotusId,
    options,
  };
  const data = useAppSelector(
    selectFilteredDataByUserAndType(nolotusId, DataType.SurfSpot),
  );
  const { isSuccess, isLoading, error } = useQueryData(queryConfig);
  const renderSpotList = (spots) => {
    if (!spots) {
      return null;
    }
    const filteredSpots = spots.filter((spot) => !spot.is_template);
    return filteredSpots.map((spot) => <SpotCard key={spot.id} data={spot} />);
  };
  return (
    <div>
      <div className="flex flex-col gap-6 lg:flex-row">
        <div
          className="text2 mb-6 w-full lg:mb-0 lg:w-1/2"
          style={{ display: "grid", gap: "var(--size-fluid-2)" }}
        >
          <h2>嘿，你好,我是Nolotus！</h2>
          <p>
            我在这里用AI管理我的一切。
            <br />
            从日常的Todos，到旅途拍摄的美景。
          </p>
          <p>
            <div className="py-3">
              无论是收集
              <Link to="/spots">旅居点</Link>
              的信息，
              <br />
              亦或是
              <Link to="/spots">各种兴趣爱好 </Link>
              的攻略。
              <br />
              例如
              <Link to="/spots">冲浪</Link>和<Link to="/spots">滑雪</Link>。
            </div>
            <div className="py-3">
              甚至是管理我的这些兴趣爱好的
              <Link to="/gears" className="text-blue-500">
                装备
              </Link>
              。
              <br />
              总而言之我用它管理我的一切数据，并分享给来到这里的你。
            </div>
          </p>
        </div>
        <aside
          className="surface2 rad-shadow w-full lg:w-1/2 "
          style={{
            display: "grid",
            gap: "var(--size-fluid-2)",
            padding: "var(--size-fluid-2)",
            boxShadow: "var(--shadow-3)",
          }}
        >
          <h3>
            如果你也想分享, 点击{" "}
            <Link to="/signup" className="font-bold underline decoration-wavy">
              注册
            </Link>{" "}
            使用
          </h3>
          <p>
            可以用AI直接对话来管理你的一切 无论照片，文字，声音，视频，
            <br />
            可以绑定你的个人域名,甚至可以搭建你的私有服务
          </p>
          <p>
            还可以进一步， 认识更多的朋友 通过
            <Link to="/itineraries">一起出发</Link>，
            <Link to="/people">寻找你周边的人</Link>，
            <Link to="/people">寻找相同兴趣爱好的人</Link>，
          </p>
        </aside>
      </div>
      <h4>
        <DependabotIcon size="medium" />
        <span>AIs</span>
      </h4>
      <ChatAIList queryUserId={userId ? userId : nolotusId} />
      <h4 className="">
        <LocationIcon size="medium" />
        浪点
      </h4>
      <div className="flex flex-wrap">{data && renderSpotList(data)}</div>
      <h4 className="">
        <PeopleIcon size="medium" />
        游民
      </h4>
    </div>
  );
};
export default Home;
