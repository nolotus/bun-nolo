import * as z from 'zod';
import {isValid} from 'date-fns';
import {utcToZonedTime} from 'date-fns-tz';

export function createTimeFieldSchema(subtype: string, metadata?: any) {
  let fieldSchema;
  switch (subtype) {
    case 'date':
      fieldSchema = z.date();
      break;
    case 'timestamp':
      fieldSchema = z.string().refine(value => isValid(new Date(value)), {
        message: 'Invalid timestamp format',
      });
      break;
    case 'duration':
      fieldSchema = z.number().min(0);
      if (metadata && metadata.unit) {
        fieldSchema = fieldSchema.refine(
          value => {
            // 添加单位转换逻辑
            return typeof value === 'number'; // 你可以根据 metadata.unit 进一步细化这里的逻辑
          },
          {message: `Duration must be in ${metadata.unit}`},
        );
      }
      break;
    case 'weekday':
      fieldSchema = z.number().int().min(0).max(6);
      if (metadata && metadata.allowedDays) {
        fieldSchema = fieldSchema.refine(
          day => metadata.allowedDays.includes(day),
          {
            message: `Weekday must be one of ${metadata.allowedDays.join(
              ', ',
            )}`,
          },
        );
      }
      break;
    case 'datetime':
      fieldSchema = z.date();
      if (metadata && metadata.timezone) {
        fieldSchema = fieldSchema.refine(
          value => {
            const zonedDate = utcToZonedTime(value, metadata.timezone);
            return isValid(zonedDate);
          },
          {message: `Time must be in ${metadata.timezone} timezone`},
        );
      }
      break;
    case 'time':
      fieldSchema = z
        .string()
        .refine(
          value => /^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(value),
          {message: 'Invalid time format'},
        );
      break;
    default:
      // 默认值为 'time' 类型的 Zod schema
      fieldSchema = z
        .string()
        .refine(
          value => /^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(value),
          {message: 'Invalid time format'},
        );
      console.warn(
        `Unknown time subtype: ${subtype}. Using default 'time' schema.`,
      );
  }
  return fieldSchema;
}
