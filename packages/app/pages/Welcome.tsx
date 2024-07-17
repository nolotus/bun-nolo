import React from "react";
import { renderContentNode } from "render";
import { USER_PROFILE_ROUTE } from "setting/routes";

const welcomeMdast = {
  type: "root",
  children: [
    {
      type: "paragraph",
      children: [
        {
          type: "heading",
          depth: 3,
          className: "text-xl font-semibold mb-4",
          children: [],
        },
        {
          type: "section",
          title: "是数字游民吗？🌍",
          className: "text-xl font-medium mb-2",
          children: [
            {
              type: "paragraph",
              className: "text-xl font-medium mb-2",
              children: [
                {
                  type: "text",
                  value: "你可以在这里",
                },
                {
                  type: "link",
                  url: "/settings",
                  className: "text-yellow-500 underline",
                  children: [
                    {
                      type: "text",
                      value: "更新个人信息",
                    },
                  ],
                },
                {
                  type: "text",
                  value: "，让大家更了解你！",
                },
              ],
            },
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  value: "也别忘了分享你的",
                },
                {
                  type: "link",
                  url: `/settings/${USER_PROFILE_ROUTE}`,
                  className: "text-purple-500 underline",
                  children: [
                    {
                      type: "text",
                      value: "兴趣爱好",
                    },
                  ],
                },
                {
                  type: "text",
                  value: "和",
                },
                {
                  type: "link",
                  url: "/settings/profile/nomad",
                  className: "text-red-500 underline",
                  children: [
                    {
                      type: "text",
                      value: "旅行计划",
                    },
                  ],
                },
                {
                  type: "text",
                  value: "！",
                },
              ],
            },
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  value: "想找同路人？",
                },
                {
                  type: "link",
                  url: "/spots",
                  className: "text-orange-500 underline",
                  children: [
                    {
                      type: "text",
                      value: "查看热门地点",
                    },
                  ],
                },
                {
                  type: "text",
                  value: "或",
                },
                {
                  type: "link",
                  url: "/people",
                  className: "text-orange-500 underline",
                  children: [
                    {
                      type: "text",
                      value: "寻找志同道合的人",
                    },
                  ],
                },
                {
                  type: "text",
                  value: "！",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
//todo change to welcome cybot
const Welcome = () => {
  return <div>{renderContentNode(welcomeMdast)}</div>;
};
export default Welcome;
