import React from "react";
import { Card } from "../ui/Card";
import { Link } from "../ui/Link";

const Home = () => {
  return (
    <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-6 font-patrick">
      <div className="w-full lg:w-1/2 mb-6 lg:mb-0">
        <header className="mb-12">
          <h1 className="text-3xl font-bold mb-10">嘿，你好,我是Nolotus！</h1>
        </header>
        <main>
          <div className="divide-y divide-gray-200 space-y-4 text-lg">
            <div className="py-4">
              我在这里用AI管理我的一切。
              <br />
              从日常的Todos，到旅途拍摄的美景。
            </div>
            <div className="py-4">
              无论是收集
              <Link to="/nomadspots" className="text-blue-500">
                旅居点
              </Link>
              的信息，
              <br />
              亦或是
              <Link to="/interestspots" className="text-blue-500">
                各种兴趣爱好{" "}
              </Link>
              的攻略。
              <br />
              例如
              <Link to="/interestspots" className="text-blue-500">
                冲浪
              </Link>
              和
              <Link to="/interestspots" className="text-blue-500">
                滑雪
              </Link>
              。
            </div>
            <div className="py-4">
              甚至是管理我的这些兴趣爱好的
              <Link to="/gears" className="text-blue-500">
                装备
              </Link>
              。<br />
              总而言之我用它管理我的一切数据，并分享给来到这里的你。
            </div>
          </div>
        </main>
      </div>
      <aside className="w-full lg:w-1/2">
        <Card className="p-12 rounded-lg text-center text-lg text-gray-700 space-y-4">
          <div className="text-3xl mb-4 font-patrick">如果你也想分享</div>
          <div className="text-2xl mb-4 font-patrick">
            点击{" "}
            <Link to="/register" className="text-blue-600 font-bold underline">
              注册
            </Link>{" "}
            使用
          </div>
          <div className="text-xl divide-y divide-gray-200 space-y-4 font-shadows">
            <div className="py-2">
              可以用AI直接对话来管理你的一切 无论照片，文字，声音，视频，
            </div>
            <div className="py-2">
              可以绑定你的个人域名,甚至可以搭建你的私有服务
            </div>
            <div className="py-2">还可以进一步， 认识更多的朋友</div>
            <div className="py-2">
              通过
              <Link to="/itineraries" className="text-blue-600">
                一起出发
              </Link>
              ，
              <Link to="/peoples" className="text-blue-600">
                寻找你周边的人
              </Link>
              ，
              <Link to="/peoples" className="text-blue-600">
                寻找相同兴趣爱好的人
              </Link>
              ，
            </div>
          </div>
        </Card>
      </aside>
    </div>
  );
};
export default Home;
