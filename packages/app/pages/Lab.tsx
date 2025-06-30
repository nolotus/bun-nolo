import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useAppSelector } from "app/hooks";
import { selectTheme } from "app/settings/settingSlice";
import Button from "render/web/ui/Button";
import {
  Input,
  NumberInput,
  TextArea,
  PasswordInput,
} from "render/web/form/Input";
import {
  SearchIcon,
  PersonIcon,
  LockIcon,
  MailIcon,
  PencilIcon,
  TagIcon,
  EyeIcon,
  GearIcon,
} from "@primer/octicons-react";
import { TagsInput } from "render/web/form/TagsInput";

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  age: number;
  bio: string;
  tags: string;
  search: string;
}

const Lab = () => {
  const theme = useAppSelector(selectTheme);
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      age: 0,
      bio: "",
      tags: "",
      search: "",
    },
  });

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    console.log("Form Data:", data);
    // 模拟异步提交
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setLoading(false);
  };

  return (
    <>
      <style href="lab" precedence="medium">{`
        .lab-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: ${theme.space[10]} ${theme.space[6]};
          background: linear-gradient(180deg, ${theme.backgroundSecondary} 0%, ${theme.background} 20%);
          min-height: 100vh;
        }

        .lab-header {
          margin-bottom: ${theme.space[12]};
          text-align: center;
        }

        .lab-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: ${theme.space[3]};
          color: ${theme.text};
          letter-spacing: -0.03em;
          background: linear-gradient(135deg, ${theme.text} 0%, ${theme.primary} 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .lab-description {
          color: ${theme.textSecondary};
          font-size: 1.125rem;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .lab-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: ${theme.space[8]};
        }

        .lab-section {
          background: ${theme.background};
          border-radius: 24px;
          padding: ${theme.space[8]} ${theme.space[6]};
          box-shadow: 
            0 4px 16px ${theme.shadow1},
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
          border: 1px solid ${theme.border};
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .lab-section:hover {
          transform: translateY(-2px);
          box-shadow: 
            0 8px 32px ${theme.shadow2},
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
          border-color: ${theme.primary}20;
        }

        .section-header {
          margin-bottom: ${theme.space[6]};
          padding-bottom: ${theme.space[4]};
          border-bottom: 1px solid ${theme.borderLight};
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 650;
          margin-bottom: ${theme.space[2]};
          color: ${theme.text};
          letter-spacing: -0.02em;
          display: flex;
          align-items: center;
          gap: ${theme.space[2]};
        }

        .section-title-icon {
          color: ${theme.primary};
        }

        .section-description {
          color: ${theme.textSecondary};
          font-size: 0.925rem;
          line-height: 1.5;
        }

        .demo-grid {
          display: flex;
          gap: ${theme.space[4]};
          flex-wrap: wrap;
          align-items: flex-start;
        }

        .demo-form {
          display: flex;
          flex-direction: column;
          gap: ${theme.space[5]};
        }

        .demo-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: ${theme.space[4]};
        }

        .demo-full-width {
          grid-column: 1 / -1;
        }

        .demo-buttons {
          display: flex;
          gap: ${theme.space[3]};
          flex-wrap: wrap;
          justify-content: flex-end;
          padding-top: ${theme.space[4]};
          border-top: 1px solid ${theme.borderLight};
        }

        .size-demo {
          display: flex;
          flex-direction: column;
          gap: ${theme.space[4]};
        }

        .size-group {
          display: flex;
          flex-direction: column;
          gap: ${theme.space[2]};
        }

        .size-label {
          font-size: 0.875rem;
          font-weight: 550;
          color: ${theme.textSecondary};
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .variant-demo {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: ${theme.space[3]};
        }

        .status-indicator {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: ${theme.primary};
          margin-right: ${theme.space[2]};
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* 响应式设计 */
        @media (max-width: 768px) {
          .lab-container {
            padding: ${theme.space[8]} ${theme.space[4]};
          }

          .lab-grid {
            grid-template-columns: 1fr;
            gap: ${theme.space[6]};
          }

          .lab-section {
            padding: ${theme.space[6]} ${theme.space[4]};
          }

          .demo-row {
            grid-template-columns: 1fr;
            gap: ${theme.space[3]};
          }

          .demo-buttons {
            justify-content: stretch;
          }

          .demo-buttons > * {
            flex: 1;
          }

          .variant-demo {
            grid-template-columns: 1fr;
          }

          .lab-title {
            font-size: 2rem;
          }
        }

        @media (max-width: 480px) {
          .lab-container {
            padding: ${theme.space[6]} ${theme.space[3]};
          }

          .lab-section {
            padding: ${theme.space[5]} ${theme.space[3]};
            border-radius: 16px;
          }

          .demo-grid {
            flex-direction: column;
          }

          .lab-title {
            font-size: 1.75rem;
          }
        }

        /* 动画偏好 */
        @media (prefers-reduced-motion: reduce) {
          .lab-section,
          .status-indicator {
            animation: none;
            transition: none;
          }
          
          .lab-section:hover {
            transform: none;
          }
        }
      `}</style>

      <div className="lab-container">
        <header className="lab-header">
          <h1 className="lab-title">
            <span className="status-indicator" />
            组件展示实验室
          </h1>
          <p className="lab-description">
            这里展示了各种表单组件的功能和样式，包括不同尺寸、变体和状态的演示
          </p>
        </header>

        <div className="lab-grid">
          {/* 按钮组件演示 */}
          <section className="lab-section">
            <div className="section-header">
              <h2 className="section-title">
                <GearIcon size={20} className="section-title-icon" />
                Button 组件
              </h2>
              <p className="section-description">
                支持多种变体、尺寸和状态的现代按钮组件
              </p>
            </div>

            <div className="size-demo">
              <div className="size-group">
                <div className="size-label">变体演示</div>
                <div className="variant-demo">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="danger">Danger</Button>
                </div>
              </div>

              <div className="size-group">
                <div className="size-label">尺寸演示</div>
                <div className="variant-demo">
                  <Button size="small">Small</Button>
                  <Button size="medium">Medium</Button>
                  <Button size="large">Large</Button>
                </div>
              </div>

              <div className="size-group">
                <div className="size-label">状态演示</div>
                <div className="variant-demo">
                  <Button icon={<SearchIcon size={16} />}>With Icon</Button>
                  <Button loading>Loading</Button>
                  <Button disabled>Disabled</Button>
                  <Button block>Block Button</Button>
                </div>
              </div>
            </div>
          </section>

          {/* 表单组件演示 */}
          <section className="lab-section">
            <div className="section-header">
              <h2 className="section-title">
                <PencilIcon size={20} className="section-title-icon" />
                表单组件
              </h2>
              <p className="section-description">
                完整的表单输入组件集合，支持验证和各种输入类型
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="demo-form">
              <div className="demo-row">
                <Input
                  label="用户名"
                  placeholder="请输入用户名"
                  icon={<PersonIcon size={16} />}
                  helperText="用户名长度为3-20个字符"
                  {...control.register("username", {
                    required: "用户名不能为空",
                    minLength: { value: 3, message: "用户名至少3个字符" },
                  })}
                  error={!!errors.username}
                />

                <Input
                  label="邮箱"
                  type="email"
                  placeholder="请输入邮箱地址"
                  icon={<MailIcon size={16} />}
                  {...control.register("email", {
                    required: "邮箱不能为空",
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: "邮箱格式不正确",
                    },
                  })}
                  error={!!errors.email}
                />
              </div>

              <div className="demo-row">
                <Input
                  label="密码"
                  password
                  placeholder="请输入密码"
                  icon={<LockIcon size={16} />}
                  helperText="密码长度至少6位"
                  {...control.register("password", {
                    required: "密码不能为空",
                    minLength: { value: 6, message: "密码至少6位" },
                  })}
                  error={!!errors.password}
                />

                <NumberInput
                  label="年龄"
                  placeholder="请输入年龄"
                  helperText="请输入真实年龄"
                  name="age"
                  control={control}
                  rules={{
                    required: "年龄不能为空",
                    min: { value: 1, message: "年龄必须大于0" },
                    max: { value: 150, message: "年龄不能超过150" },
                  }}
                />
              </div>

              <div className="demo-full-width">
                <TextArea
                  label="个人简介"
                  placeholder="请输入个人简介..."
                  icon={<PencilIcon size={16} />}
                  autoResize
                  helperText="简要介绍一下自己"
                  {...control.register("bio")}
                />
              </div>

              <div className="demo-full-width">
                <TagsInput
                  label="技能标签"
                  placeholder="输入技能标签，按回车添加"
                  name="tags"
                  control={control}
                  maxTags={10}
                  helperText="最多可添加10个技能标签"
                />
              </div>

              <div className="demo-buttons">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => console.log("Reset clicked")}
                >
                  重置
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  icon={<SearchIcon size={16} />}
                >
                  {loading ? "提交中..." : "提交表单"}
                </Button>
              </div>
            </form>
          </section>

          {/* 尺寸演示 */}
          <section className="lab-section">
            <div className="section-header">
              <h2 className="section-title">
                <EyeIcon size={20} className="section-title-icon" />
                尺寸对比
              </h2>
              <p className="section-description">不同尺寸的组件对比展示</p>
            </div>

            <div className="size-demo">
              <div className="size-group">
                <div className="size-label">Small</div>
                <div className="demo-grid">
                  <Input
                    size="small"
                    placeholder="Small input"
                    icon={<SearchIcon size={14} />}
                  />
                  <Button size="small">Small Button</Button>
                </div>
              </div>

              <div className="size-group">
                <div className="size-label">Medium (默认)</div>
                <div className="demo-grid">
                  <Input
                    placeholder="Medium input"
                    icon={<SearchIcon size={16} />}
                  />
                  <Button>Medium Button</Button>
                </div>
              </div>

              <div className="size-group">
                <div className="size-label">Large</div>
                <div className="demo-grid">
                  <Input
                    size="large"
                    placeholder="Large input"
                    icon={<SearchIcon size={18} />}
                  />
                  <Button size="large">Large Button</Button>
                </div>
              </div>
            </div>
          </section>

          {/* 变体演示 */}
          <section className="lab-section">
            <div className="section-header">
              <h2 className="section-title">
                <TagIcon size={20} className="section-title-icon" />
                变体样式
              </h2>
              <p className="section-description">不同样式变体的组件展示</p>
            </div>

            <div className="size-demo">
              <div className="size-group">
                <div className="size-label">Default</div>
                <Input
                  variant="default"
                  placeholder="Default variant"
                  icon={<SearchIcon size={16} />}
                />
              </div>

              <div className="size-group">
                <div className="size-label">Filled</div>
                <Input
                  variant="filled"
                  placeholder="Filled variant"
                  icon={<SearchIcon size={16} />}
                />
              </div>

              <div className="size-group">
                <div className="size-label">Ghost</div>
                <Input
                  variant="ghost"
                  placeholder="Ghost variant"
                  icon={<SearchIcon size={16} />}
                />
              </div>

              <div className="size-group">
                <div className="size-label">Password Input</div>
                <Input
                  password
                  placeholder="Password input"
                  icon={<LockIcon size={16} />}
                />
              </div>

              <div className="size-group">
                <div className="size-label">TextArea with Auto Resize</div>
                <TextArea
                  autoResize
                  placeholder="This textarea will auto-resize as you type..."
                  variant="filled"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default Lab;
