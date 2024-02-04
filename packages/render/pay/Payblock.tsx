import React from "react";

// 更新PaymentDetail接口，将name改为title
interface PaymentDetail {
  pay_time: string;
  type: string;
  price: number;
  categories: string;
  title: string; // 已更新为title
  recipient_info?: {
    name: string;
    details: string;
  };
  payment_method?: string;
  confirmation_number?: string;
  notes?: string;
  reminder?: string;
}

// 为PayBlock组件的props定义类型
interface PayBlockProps {
  data: PaymentDetail;
}

// 改造后的PayBlock组件，动态显示所有字段
export const PayBlock: React.FC<PayBlockProps> = ({ data }) => {
  return (
    <div>
      <div>{data.title}</div>
      <div>{data.price}</div>
      {/* 动态展示其它字段 */}
      {data.pay_time && <div>支付时间: {data.pay_time}</div>}
      {data.type && <div>类型: {data.type}</div>}
      {data.categories && <div>类别: {data.categories}</div>}
      {data.recipient_info && (
        <>
          {data.recipient_info.name && (
            <div>收款方名称: {data.recipient_info.name}</div>
          )}
          {data.recipient_info.details && (
            <div>收款方详情: {data.recipient_info.details}</div>
          )}
        </>
      )}
      {data.payment_method && <div>支付方式: {data.payment_method}</div>}
      {data.confirmation_number && (
        <div>确认号: {data.confirmation_number}</div>
      )}
      {data.notes && <div>备注: {data.notes}</div>}
      {data.reminder && <div>提醒时间: {data.reminder}</div>}
    </div>
  );
};
