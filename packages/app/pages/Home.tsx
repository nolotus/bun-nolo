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
import { sizes } from "render/ui/stylePresets";

const Home = () => {
  const userId = useAppSelector(selectCurrentUserId);

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: sizes.sizeFluid1,
        }}
      >
        <h2>嘿，你好，我是Nolotus！</h2>
        <h2>嗨，欢迎来到这里！👋，!</h2>
        <h3>本站测试中，任何问题请邮件至s@nolotus.com</h3>
        <p>
          我在这里用AI <DependabotIcon size="medium" />
          管理我的一切,从日常的Todo，财务，到旅途拍摄的美景。
        </p>
        <Cybots queryUserId={userId ? userId : nolotusId} limit={9} />

        <SpotList userId={nolotusId} />
        <h4>如果你也想分享你的生活,用AI管理你的数据</h4>
        <h3>
          请
          <Link
            to="/signup"
            style={{
              fontWeight: "bold",
              textDecoration: "underline",
              textDecorationStyle: "wavy",
            }}
          >
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
      </div>
    </div>
  );
};

export default Home;
