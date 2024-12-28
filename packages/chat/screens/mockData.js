// mockData.js
export const initialDialogData = [
  // 有分组的数据
  {
    group: "工作助手",
    expanded: true,
    items: [
      {
        id: "1",
        userName: "张三助手",
        lastMessage: "项目进度已更新，请查看最新文档",
        timestamp: "昨天",
      },
      {
        id: "2",
        userName: "项目经理助手",
        lastMessage: "下周计划讨论",
        timestamp: "上午 11:30",
      },
    ],
  },
  {
    group: "学习助手",
    expanded: true,
    items: [
      {
        id: "3",
        userName: "李四助手",
        lastMessage: "会议材料已准备好",
        timestamp: "上午 10:00",
      },
    ],
  },
  // 无分组的对话
  {
    id: "4",
    userName: "技术支持",
    lastMessage: "您的问题已收到，正在处理中",
    timestamp: "刚刚",
  },
  {
    id: "5",
    userName: "客服小王",
    lastMessage: "请问还有什么需要帮助的吗？",
    timestamp: "15分钟前",
  },
];

export const dialogDetails = [
  {
    id: '1',
    messages: [
      { sender: 'user', message: '你好，我想了解一下项目的进度。',  avatar: require('./assets/user-avatar.png')},
      { sender: 'ai', message: '你好！目前项目进展顺利，我们正在按计划进行。' ,  avatar: require('./assets/ai-avatar.png')},
      { sender: 'user', message: '那太好了，有什么需要我帮忙的吗？',  avatar: require('./assets/user-avatar.png')},
      { sender: 'ai', message: '暂时没有，如果有需要我会及时通知你。', avatar: require('./assets/ai-avatar.png') },
    ]
  },
  {
    id: '2',
    messages: [
      { sender: 'user', message: '下周三的会议安排好了吗？',  avatar: require('./assets/user-avatar.png')},
      { sender: 'ai', message: '是的，会议已经安排在下周三上午 10:00，地点是会议室 A。',  avatar: require('./assets/ai-avatar.png')},
    ]
  },
  {
    id: '3',
    messages: [
      { sender: 'user', message: '设计稿的反馈收到了吗？',  avatar: require('./assets/user-avatar.png')},
      { sender: 'ai', message: '收到了，我们已经审核完毕，请根据反馈意见进行修改。',  avatar: require('./assets/ai-avatar.png')},
    ]
  },
  {
    id: '4',
    messages: [
      { sender: 'user', message: '我的账户登录有问题，能帮忙解决吗？',  avatar: require('./assets/user-avatar.png')},
      { sender: 'ai', message: '当然可以，请提供您的账户信息，我们会尽快处理。', avatar: require('./assets/ai-avatar.png') },
      { sender: 'user', message: '我的账户是 user123。', avatar: require('./assets/user-avatar.png') },
      { sender: 'ai', message: '已收到，正在为您排查问题，请稍等。',  avatar: require('./assets/ai-avatar.png')},
    ]
  },
  {
    id: '5',
    messages: [
      { sender: 'user', message: '我想咨询一下产品的售后服务。', avatar: require('./assets/user-avatar.png') },
      { sender: 'ai', message: '您好！请问您遇到什么问题？我们会尽快为您解决。' , avatar: require('./assets/ai-avatar.png')},
      { sender: 'user', message: '我的产品无法正常启动。', avatar: require('./assets/user-avatar.png')},
      { sender: 'ai', message: '请检查电源是否连接正常，如果问题依旧，请提供产品型号。', avatar: require('./assets/ai-avatar.png') },
    ]
  }
];
