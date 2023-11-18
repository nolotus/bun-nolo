import { createFieldsFromDSL } from 'components/Form/createFieldsFromDSL';
import { createZodSchemaFromDSL } from 'database/schema/createZodSchemaFromDSL';

import { ModelPriceEnum } from './model/modelPrice';
export const dsl = {
  name: {
    type: 'string',
    min: 1,
  },
  description: {
    type: 'textarea',
    min: 1,
  },
  type: {
    type: 'string',
    readOnly: true,
    default: 'chatRobot',
    readonly: true,
  },
  model: {
    type: 'enum',
    values: Object.values(ModelPriceEnum),
  },
  replyRule: {
    type: 'textarea',
    min: 1,
    optional: true,
  },
  knowledge: {
    type: 'textarea',
    min: 1,
    optional: true,
  },
  path: {
    type: 'string',
    min: 1,
    optional: true,
  },
};

export const schema = createZodSchemaFromDSL(dsl);
export const fields = createFieldsFromDSL(dsl);
