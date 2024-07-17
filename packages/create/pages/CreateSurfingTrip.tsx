// CreateSurfingTrip.tsx
import { useAuth } from "auth/useAuth";
import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

const CreateSurfingTrip = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      if (auth.user?.userId) {
        // const result = await write({
        //   data,
        //   flags: { isJSON: true },
        //   userId: auth.user?.userId,
        //   customId: ulid(),
        // }).unwrap();
        // 如果成功，跳转到新创建的行程页面
        // navigate(`/${result.id}`); // 假设返回的对象中有一个id字段
      }
    } catch (err) {}
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h2 className="text-lg">创建冲浪行程信息</h2>
      {/* 表单字段 */}
      <div>
        <label htmlFor="location">地点：</label>
        <input id="location" {...register("location", { required: true })} />
      </div>
      <div>
        <label htmlFor="time">时间：</label>
        <input
          type="time"
          id="time"
          {...register("time", { required: true })}
        />
      </div>
      <div>
        <label htmlFor="surfboard">提供的装备：</label>
        <select id="surfboard" {...register("surfboard", { required: true })}>
          <option value="9-foot-longboard">9尺长板</option>
          <option value="7.6-foot-midboard">7.6尺中板</option>
        </select>
      </div>
      <div>
        <label htmlFor="sunscreen">提供的其他装备：</label>
        <input id="sunscreen" {...register("sunscreen")} />
      </div>
      <div>
        <label htmlFor="wetsuitAdvice">湿衣建议：</label>
        <input id="wetsuitAdvice" {...register("wetsuitAdvice")} />
      </div>
      {/* 更多字段 */}
      <input type="submit" value="创建行程模板" />
    </form>
  );
};

export default CreateSurfingTrip;
