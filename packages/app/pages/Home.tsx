import React from "react";
import { Card, Link } from "ui";

const Home = () => {
  return (
    <div className="container mx-auto flex flex-col gap-6 font-sans lg:flex-row">
      <div className="mb-6 w-full lg:mb-0 lg:w-1/2">
        <header className="mb-12">
          <h1 className="mb-10 text-3xl font-bold ">嘿，你好,我是Nolotus！</h1>
        </header>
        <main>
          <div className="divide-y divide-gray-200 text-lg">
            <div className="py-4">
              我在这里用AI管理我的一切。
              <br />
              从日常的Todos，到旅途拍摄的美景。
            </div>
            <div className="py-4">
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
            <div className="py-4">
              甚至是管理我的这些兴趣爱好的
              <Link to="/gears" className="text-blue-500">
                装备
              </Link>
              。
              <br />
              总而言之我用它管理我的一切数据，并分享给来到这里的你。
            </div>
          </div>
        </main>
      </div>
      <aside className="w-full lg:w-1/2">
        <Card className="space-y-4  p-12 text-center text-lg text-gray-700">
          <div className="font-shadows space-y-4 divide-y divide-gray-200 text-xl">
            <div className="font-patrick mb-4 text-2xl">
              如果你也想分享, 点击{" "}
              <Link
                to="/register"
                className="font-bold underline decoration-wavy"
              >
                注册
              </Link>{" "}
              使用
            </div>
            <div className="py-2">
              可以用AI直接对话来管理你的一切 无论照片，文字，声音，视频，
            </div>
            <div className="py-2">
              可以绑定你的个人域名,甚至可以搭建你的私有服务
            </div>
            <div className="py-2">还可以进一步， 认识更多的朋友</div>
            <div className="py-2">
              通过
              <Link to="/itineraries">一起出发</Link>，
              <Link to="/people">寻找你周边的人</Link>，
              <Link to="/people">寻找相同兴趣爱好的人</Link>，
            </div>
          </div>
        </Card>
      </aside>
    </div>
  );
};
export default Home;
