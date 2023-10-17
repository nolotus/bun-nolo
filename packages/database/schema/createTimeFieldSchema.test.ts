import * as z from 'zod';
import {isValid} from 'date-fns';
import {utcToZonedTime} from 'date-fns-tz';

import {createTimeFieldSchema} from './createTimeFieldSchema';

describe('createTimeFieldSchema', () => {
  it('should correctly generate Zod schema for date', () => {
    const fieldSchema = createTimeFieldSchema('date');
    expect(fieldSchema.toString()).toEqual(z.date().toString());
  });

  it('should correctly generate Zod schema for timestamp', () => {
    const fieldSchema = createTimeFieldSchema('timestamp');
    expect(fieldSchema.toString()).toEqual(
      z
        .string()
        .refine(value => isValid(new Date(value)), {
          message: 'Invalid timestamp format',
        })
        .toString(),
    );
  });

  it('should correctly generate Zod schema for duration', () => {
    const fieldSchema = createTimeFieldSchema('duration', {unit: 'seconds'});
    expect(fieldSchema.toString()).toEqual(z.number().min(0).toString());
  });

  it('should correctly generate Zod schema for weekday', () => {
    const fieldSchema = createTimeFieldSchema('weekday', {
      allowedDays: [0, 1, 2],
    });
    expect(fieldSchema.toString()).toEqual(
      z
        .number()
        .int()
        .min(0)
        .max(6)
        .refine(day => [0, 1, 2].includes(day), {
          message: 'Weekday must be one of 0, 1, 2',
        })
        .toString(),
    );
  });

  it('should correctly generate Zod schema for datetime with timezone', () => {
    const fieldSchema = createTimeFieldSchema('datetime', {
      timezone: 'America/New_York',
    });
    expect(fieldSchema.toString()).toEqual(
      z
        .date()
        .refine(
          value => {
            const zonedDate = utcToZonedTime(value, 'America/New_York');
            return isValid(zonedDate);
          },
          {message: 'Time must be in America/New_York timezone'},
        )
        .toString(),
    );
  });

  it('should correctly generate Zod schema for time', () => {
    const fieldSchema = createTimeFieldSchema('time');
    expect(fieldSchema.toString()).toEqual(
      z
        .string()
        .refine(
          value => /^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(value),
          {message: 'Invalid time format'},
        )
        .toString(),
    );
  });

  it('should use default time schema for unknown subtype', () => {
    const fieldSchema = createTimeFieldSchema('unknown');
    expect(fieldSchema.toString()).toEqual(
      z
        .string()
        .refine(
          value => /^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(value),
          {message: 'Invalid time format'},
        )
        .toString(),
    );
  });
});
