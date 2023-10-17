import * as z from 'zod';
import {getLogger} from 'utils/logger';
import {createTimeFieldSchema} from './createTimeFieldSchema';

const schemaLogger = getLogger('schema');
// 定义可用的转换
const TRANSFORMS = {
  toLowerCase: value => value.toLowerCase(),
  // ...可以在此添加其他转换
};

const createFieldSchemaByType = (field, key) => {
  schemaLogger.debug(
    `Creating schema for field ${key} with type ${field.type}`,
  );

  const typeMapping = {
    time: () => createTimeFieldSchema(field.subtype, field.metadata),
    textarea: () => z.string(),
    file: () => z.any(),
    string: () => z.string(),
    email: () => z.string().email(),
    url: () => z.string().url(),
    uuid: () =>
      z
        .string()
        .refine(
          value =>
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
              value,
            ),
          {message: 'Invalid UUID'},
        ),
    regex: () => {
      if (!field.regex) {
        throw new Error(`Regex is not defined for field: ${key}`);
      }
      return z.string().refine(value => new RegExp(field.regex).test(value));
    },
    integer: () => z.number().int(),
    float: () => z.number(),
    number: () => z.number(),
    boolean: () => z.boolean(),
    enum: () => z.enum(field.values),
    array: () =>
      z.array(
        typeof field.subtype === 'string'
          ? z[field.subtype]()
          : field.values
          ? z.enum(field.values)
          : createZodSchemaFromDSL({[key]: field.subtype}).shape[key],
      ),
    object: () => createZodSchemaFromDSL(field.fields),
  };

  const fieldSchemaCreator = typeMapping[field.type];
  if (!fieldSchemaCreator) {
    schemaLogger.error(`Unknown field type: ${field.type}`);
    throw new Error(`Unknown field type: ${field.type}`);
  }

  return fieldSchemaCreator();
};

const applyAdditionalOptions = (fieldSchema, field) => {
  let schema = fieldSchema;

  if (field.min && typeof schema.min === 'function') {
    schema = schema.min(field.min);
  }

  if (
    ['string', 'number', 'array'].includes(field.type) &&
    field.max !== undefined
  ) {
    schema = schema.max(field.max);
  }

  if (field.transform) {
    const transform = TRANSFORMS[field.transform];
    if (!transform) {
      throw new Error(`Unknown transform: ${field.transform}`);
    }
    schema = schema.transform(transform);
  }

  if (field.default) {
    schema = schema.optional().default(field.default);
  }

  if (field.refine) {
    schema = schema.refine(field.refine.validator, {
      message: field.refine.message,
    });
  }

  return schema;
};

export const createZodSchemaFromDSL = dsl => {
  schemaLogger.info('Creating Zod schema from DSL');

  let zodSchema = {};

  for (const key in dsl) {
    let field = dsl[key];
    schemaLogger.debug(`Processing field: ${key}, with data: %j`, field);
    let fieldSchema = createFieldSchemaByType(field, key);

    if (field.optional) {
      schemaLogger.debug(`Making field ${key} optional`);
      fieldSchema = fieldSchema.optional();
    }

    fieldSchema = applyAdditionalOptions(fieldSchema, field);

    schemaLogger.info('Generated fieldSchema: %j', fieldSchema);

    zodSchema[key] = fieldSchema;
  }
  schemaLogger.info('Zod schema created successfully: %j', zodSchema);
  return z.object(zodSchema);
};

// TODO: 更复杂的场景
// - 带验证的数组：需要自定义验证逻辑
// - 条件字段数组：需要处理字段间的依赖关系
// - 混合类型数组：需要处理多种数据类型
// - 动态数组长度：需要根据其他字段动态设置长度
// - 带有附件的数组：需要处理文件验证
// - 依赖于外部源的数组：需要与外部API或数据源交互
