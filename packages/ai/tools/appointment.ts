import { DataType } from "create/types";
import { write } from "database/dbSlice";

export const makeAppointmentTool = {
  type: "function",
  function: {
    name: "make_appointment",
    description: "创建日历预约事件",
    parameters: {
      type: "object",
      properties: {
        date: {
          type: "string",
          description: "预约日期,格式:YYYY-MM-DD",
          pattern: "^\\d{4}-\\d{2}-\\d{2}$",
        },
        time: {
          type: "string",
          description: "预约时间,24小时制,格式:HH:mm",
          pattern: "^([01]\\d|2[0-3]):([0-5]\\d)$",
        },
        numberOfPeople: {
          type: "integer",
          description: "参与人数",
          minimum: 1,
          maximum: 100,
        },
        event: {
          type: "string",
          description: "事件名称",
          minLength: 1,
          maxLength: 100,
        },
      },
      required: ["date", "time", "numberOfPeople", "event"],
    },
  },
};
export const makeAppointment = (args, thunkApi, currentUserId) => {
  // 参数验证
  const errors = validateAppointment(args);
  if (errors.length > 0) {
    throw new Error(`Invalid appointment data: ${errors.join(", ")}`);
  }

  const calendarEvent = {
    summary: args.event,
    description: `参与人数: ${args.numberOfPeople}人`,
    start: {
      dateTime: `${args.date}T${args.time}:00+08:00`,
    },
    end: {
      dateTime: `${args.date}T${addHours(args.time)}:00+08:00`,
    },
  };

  try {
    thunkApi.dispatch(
      write({
        data: {
          type: DataType.CalendarEvent,
          ...calendarEvent,
        },
      })
    );
    return `预约成功 ${JSON.stringify(calendarEvent)}`;
  } catch (error) {
    throw new Error(`预约失败: ${error.message}`);
  }
};

// 辅助函数
function validateAppointment(args) {
  const errors = [];

  // 验证日期格式
  if (!/^\d{4}-\d{2}-\d{2}$/.test(args.date)) {
    errors.push("日期格式错误,应为YYYY-MM-DD");
  }

  // 验证时间格式
  if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(args.time)) {
    errors.push("时间格式错误,应为HH:mm");
  }

  // 验证人数
  if (
    !Number.isInteger(args.numberOfPeople) ||
    args.numberOfPeople < 1 ||
    args.numberOfPeople > 100
  ) {
    errors.push("参与人数应在1-100之间");
  }

  // 验证事件名
  if (!args.event || args.event.length < 1 || args.event.length > 100) {
    errors.push("事件名长度应在1-100字符之间");
  }

  return errors;
}

function addHours(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return `${(hours + 1).toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}
