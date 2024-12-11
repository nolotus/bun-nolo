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
    <div
      style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "2rem",
      }}
    >
      <section
        style={{
          textAlign: "center",
          marginBottom: "3rem",
        }}
      >
        <h1
          style={{
            fontSize: "2.5rem",
            marginBottom: "1rem",
          }}
        >
          嘿，你好，我是Nolotus！👋
        </h1>

        <p
          style={{
            fontSize: "1.1rem",
            color: "#666",
            maxWidth: "700px",
            margin: "0 auto 2rem",
          }}
        >
          我在这里用AI <DependabotIcon size="medium" />
          管理我的一切,从日常的Todo，财务，到旅途拍摄的美景。
        </p>
      </section>

      {/* AI内容展示区 */}
      <div
        style={{
          marginBottom: "3rem",
        }}
      >
        <Cybots queryUserId={userId ? userId : nolotusId} limit={6} />
      </div>

      {/* 景点展示区 */}
      <div
        style={{
          marginBottom: "3rem",
        }}
      >
        <SpotList userId={nolotusId} />
      </div>

      {/* 注册引导区 */}
      <div
        style={{
          background: "#f8f9fa",
          padding: "2rem",
          borderRadius: "12px",
          maxWidth: "800px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "1.2rem",
            marginBottom: "1rem",
          }}
        >
          如果你也想分享你的生活,用AI管理你的数据， 请
          <Link
            to="/signup"
            style={{
              color: "#0066cc",
              fontWeight: "bold",
              textDecoration: "none",
              borderBottom: "2px solid #0066cc",
            }}
          >
            注册
          </Link>
          使用吧！
        </p>

        <p
          style={{
            color: "#666",
            lineHeight: "1.6",
          }}
        >
          可以用AI直接对话来管理你的一切 无论照片，文字，声音，视频，
          他们可以只存在你的本地，也可以同步多个设备和系统，并且从保存那一刻就加密。
          还可以绑定你的个人域名,甚至通过开源代码搭建你的私有服务。
        </p>
      </div>

      <footer
        style={{
          textAlign: "center",
          marginTop: "3rem",
          color: "#666",
          fontSize: "0.9rem",
        }}
      >
        本站测试中，任何问题请邮件至s@nolotus.com
      </footer>
    </div>
  );
};

export default Home;
