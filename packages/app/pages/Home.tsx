import { Link } from "render/ui";
import { nolotusId } from "core/init";

import Cybots from "ai/cybot/Cybots";

import { useAppSelector } from "app/hooks";

import {
  LocationIcon,
  PeopleIcon,
  DependabotIcon,
} from "@primer/octicons-react";
import React from "react";
import { selectCurrentUserId } from "auth/authSlice";
import { SpotList } from "render/components/SpotList";
const Home = () => {
  const userId = useAppSelector(selectCurrentUserId);

  return (
    <div>
      <div
        className="flex flex-col gap-6"
        style={{ gap: "var(--size-fluid-1)" }}
      >
        <h2>嘿，你好，我是Nolotus！</h2>
        <h2>嗨，欢迎来到这里！👋，本站还在测试中!</h2>
        <h3>很多功能都不完善，如果你有任何问题请发送邮件至s@nolotus.com</h3>
        <p>
          我在这里用AI <DependabotIcon size="medium" />
          管理我的一切,从日常的Todo，财务，到旅途拍摄的美景。
        </p>
        <Cybots queryUserId={userId ? userId : nolotusId} limit={9} />
        <h3>
          分享旅居路上各种信息
          <LocationIcon size="medium" />
        </h3>
        <p>
          无论是
          <Link to="/spots">旅居点</Link>， 亦或是
          <Link to="/spots">各种兴趣爱好 </Link>
          的攻略。 例如<Link to="/spots">冲浪</Link>和
          <Link to="/spots">滑雪</Link>。
        </p>
        <SpotList userId={nolotusId} />
        <h4>如果你也想分享你的生活,用AI管理你的数据</h4>
        <h3>
          请
          <Link to="/signup" className="font-bold underline decoration-wavy">
            注册
          </Link>{" "}
          使用吧！
        </h3>
        <p>
          可以用AI直接对话来管理你的一切 无论照片，文字，声音，视频，
          <br />
          他们可以只存在你的本地，也可以同步多个设备和系统，并且从保存那一刻就加密
          <br />
          还可以绑定你的个人域名,甚至通过开源代码搭建你的私有服务
        </p>
        {/* <h3>
          这里不仅仅有我，还有我的朋友 <PeopleIcon size="medium" />
        </h3>
        <p>
          我们可以一起出发旅行，也可以认识你附近的人，或者寻找跟你相同爱好的人
        </p> */}
        {/* <p>
          甚至是管理我的这些兴趣爱好的
          <Link to="/gears" className="text-blue-500">
            装备
          </Link>
          。
          <br />
        </p> */}
        {/* 
 
  */}
      </div>
    </div>
  );
};
export default Home;
