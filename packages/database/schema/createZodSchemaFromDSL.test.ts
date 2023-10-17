import {createZodSchemaFromDSL} from './createZodSchemaFromDSL';
import * as z from 'zod';

describe('createZodSchemaFromDSL', () => {
  it('should correctly generate Zod schema for uuid', () => {
    const dsl = {test: {type: 'uuid'}};
    const uuidv4Regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const expectedSchema = z.object({
      test: z.string().refine(value => uuidv4Regex.test(value)),
    });

    const actualSchema = createZodSchemaFromDSL(dsl);
    expect(actualSchema.toString()).toEqual(expectedSchema.toString());
  });

  it('should correctly generate Zod schema for regex', () => {
    const dsl = {test: {type: 'regex', regex: '^[a-z]$'}};
    const expectedSchema = z.object({
      test: z.string().refine(value => new RegExp('^[a-z]$').test(value)),
    });

    const actualSchema = createZodSchemaFromDSL(dsl);
    expect(actualSchema.toString()).toEqual(expectedSchema.toString());
  });

  it('should correctly generate Zod schema for integer', () => {
    const dsl = {test: {type: 'integer', min: 1, max: 100}};
    const expectedSchema = z.object({test: z.number().int().min(1).max(100)});

    const actualSchema = createZodSchemaFromDSL(dsl);
    expect(actualSchema.toString()).toEqual(expectedSchema.toString());
  });

  it('should correctly generate Zod schema for float', () => {
    const dsl = {test: {type: 'float', min: 0.1, max: 1.0}};
    const expectedSchema = z.object({test: z.number().min(0.1).max(1.0)});

    const actualSchema = createZodSchemaFromDSL(dsl);
    expect(actualSchema.toString()).toEqual(expectedSchema.toString());
  });

  it('should correctly generate Zod schema for enum', () => {
    const dsl = {test: {type: 'enum', values: ['a', 'b', 'c']}};
    const expectedSchema = z.object({test: z.enum(['a', 'b', 'c'])});

    const actualSchema = createZodSchemaFromDSL(dsl);
    expect(actualSchema.toString()).toEqual(expectedSchema.toString());
  });

  it('should correctly generate Zod schema for optional', () => {
    const dsl = {test: {type: 'string', optional: true}};
    const expectedSchema = z.object({test: z.string().optional()});

    const actualSchema = createZodSchemaFromDSL(dsl);
    expect(actualSchema.toString()).toEqual(expectedSchema.toString());
  });

  it('should correctly generate Zod schema for array of primitives', () => {
    const dsl = {test: {type: 'array', subtype: 'string'}};
    const expectedSchema = z.object({test: z.array(z.string())});

    const actualSchema = createZodSchemaFromDSL(dsl);
    expect(actualSchema.toString()).toEqual(expectedSchema.toString());
  });

  it('should correctly generate Zod schema for array of objects', () => {
    const dsl = {
      test: {
        type: 'array',
        subtype: {type: 'object', fields: {sub: {type: 'string'}}},
      },
    };
    const expectedSchema = z.object({
      test: z.array(z.object({sub: z.string()})),
    });

    const actualSchema = createZodSchemaFromDSL(dsl);
    expect(actualSchema.toString()).toEqual(expectedSchema.toString());
  });

  it('should correctly generate Zod schema for object', () => {
    const dsl = {test: {type: 'object', fields: {sub: {type: 'string'}}}};
    const expectedSchema = z.object({test: z.object({sub: z.string()})});

    const actualSchema = createZodSchemaFromDSL(dsl);
    expect(actualSchema.toString()).toEqual(expectedSchema.toString());
  });

  it('should throw error for unknown field type', () => {
    const dsl = {test: {type: 'unknown'}};
    expect(() => createZodSchemaFromDSL(dsl)).toThrow(
      `Unknown field type: unknown`,
    );
  });

  it('should throw error for unknown transform', () => {
    const dsl = {test: {type: 'string', transform: 'unknown'}};
    expect(() => createZodSchemaFromDSL(dsl)).toThrow(
      `Unknown transform: unknown`,
    );
  });
  it('should correctly generate Zod schema with default value', () => {
    const dsl = {test: {type: 'string', default: 'Hello'}};
    const expectedSchema = z.object({
      test: z.string().optional().default('Hello'),
    });

    const actualSchema = createZodSchemaFromDSL(dsl);
    expect(actualSchema.toString()).toEqual(expectedSchema.toString());
  });
  it('should correctly generate Zod schema for all types and conditions', () => {
    const dsl = {
      stringTest: {type: 'string', min: 1, max: 10, transform: 'toLowerCase'},
      numberTest: {type: 'number', min: 1, max: 100, default: 50},
      booleanTest: {type: 'boolean'},
      emailTest: {type: 'email'},
      urlTest: {type: 'url'},
      uuidTest: {type: 'uuid'},
      regexTest: {type: 'regex', regex: '^[a-z]$'},
      integerTest: {type: 'integer', min: 1, max: 100},
      floatTest: {type: 'float', min: 0.1, max: 1.0},
      enumTest: {type: 'enum', values: ['a', 'b', 'c']},
      timeTest: {type: 'time'},
      optionalTest: {optional: true, type: 'string'},
      arrayTest: {type: 'array', subtype: 'string'},
      objectTest: {type: 'object', fields: {sub: {type: 'string'}}},
    };
    const uuidv4Regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const expectedSchema = z.object({
      stringTest: z
        .string()
        .min(1)
        .max(10)
        .transform(v => v.toLowerCase()),
      numberTest: z.number().min(1).max(100).optional().default(50),
      booleanTest: z.boolean(),
      emailTest: z.string().email(),
      urlTest: z.string().url(),
      uuidTest: z
        .string()
        .refine(v => uuidv4Regex.test(v), {message: 'Invalid UUID'}),
      regexTest: z.string().refine(v => new RegExp('^[a-z]$').test(v)),
      integerTest: z.number().int().min(1).max(100),
      floatTest: z.number().min(0.1).max(1.0),
      enumTest: z.enum(['a', 'b', 'c']),
      timeTest: z
        .string()
        .refine(
          value => /^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(value),
          {message: 'Invalid time format'},
        ),
      optionalTest: z.string().optional(),
      arrayTest: z.array(z.string()),
      objectTest: z.object({sub: z.string()}),
    });

    const actualSchema = createZodSchemaFromDSL(dsl);
    expect(actualSchema.toString()).toEqual(expectedSchema.toString());
  });
});
