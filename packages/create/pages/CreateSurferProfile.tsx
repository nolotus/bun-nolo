// CreateSurferProfile.tsx
import { useStore } from 'app';
import { useAuth } from 'app/hooks';
import { nolotusId } from 'core/init';
import { useWriteHashMutation } from 'database/service';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
const CreateSurferProfile = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [writeHash, { isLoading, isSuccess, isError, error }] =
    useWriteHashMutation();

  const onSubmit = async (data) => {
    // 在提交数据中增加 type 字段
    const submissionData = {
      ...data,
      type: 'surf-profile',
    };

    if (auth.user) {
      submissionData.userId = auth.user.userId;
    }

    try {
      const result = await writeHash({
        data: submissionData,
        flags: { isJSON: true },
        userId: nolotusId,
      }).unwrap();
      console.log('result', result);
    } catch (error) {
      console.error('Submission error:', error);
      // 在这里处理错误
    }
  };

  const [searchParams] = useSearchParams();
  const tripId = searchParams.get('tripId');
  const auth = useAuth();
  const tripDetails = useStore(tripId); // 使用新的参数名

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h2 className="text-lg">填写个人冲浪资料</h2>
      {tripDetails.id && (
        <>
          <p>地点：{tripDetails.location}</p>
          <p>时间：{tripDetails.time}</p>
          <p>提供的装备：{tripDetails.surfboard}</p>
          <p>提供的其他装备：{tripDetails.sunscreen}</p>
          <p>湿衣建议：{tripDetails.wetsuitAdvice}</p>
        </>
      )}
      {/* 表单字段 */}
      <div>
        <label htmlFor="nickname">昵称：</label>
        <input
          type="text"
          id="nickname"
          {...register('nickname', { required: true })}
        />
        {/* 添加提示链接或注册按钮 */}
        <span>
          已经注册？
          <a href="/login" className="text-blue-500 hover:text-blue-700">
            直接登录
          </a>
          {/* 如果没有注册页面，可以用按钮代替 */}
          {/* <button type="button" onClick={handleRegister}>直接注册</button> */}
        </span>
      </div>
      <div>
        <label htmlFor="height">个人身高：</label>
        <input
          type="number"
          id="height"
          {...register('height', { required: true })}
        />
      </div>
      <div>
        <label htmlFor="weight">体重：</label>
        <input
          type="number"
          id="weight"
          {...register('weight', { required: true })}
        />
      </div>
      <div>
        <label htmlFor="canSwim">是否会游泳：</label>
        <input type="checkbox" id="canSwim" {...register('canSwim')} />
      </div>
      <div>
        <label htmlFor="fearOfWater">是否害怕水：</label>
        <input type="checkbox" id="fearOfWater" {...register('fearOfWater')} />
      </div>
      {/* 更多字段 */}
      <input type="submit" value="提交个人资料" />
    </form>
  );
};

export default CreateSurferProfile;
