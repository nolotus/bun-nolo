import {createFieldsFromDSL} from 'components/Form/createFieldsFromDSL';
import {createZodSchemaFromDSL} from 'database/schema/createZodSchemaFromDSL';

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
    values: [
      'gpt-3.5-turbo',
      'gpt-3.5-turbo-16k',
      'gpt-3.5-turbo-0613',
      'gpt-3.5-turbo-16k-0613',
      'gpt-4',
      'gpt-4-0613',
      'gpt-4-0314',
    ],
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
