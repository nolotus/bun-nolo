import { createFieldsFromDSL } from "components/Form/createFieldsFromDSL";
import { createZodSchemaFromDSL } from "database/schema/createZodSchemaFromDSL";

import { ModelPriceEnum } from "./models";
import { DataType } from "create/types";
//for page create
export const dsl = {
  name: {
    type: "string",
    min: 1,
  },
  description: {
    type: "textarea",
    min: 1,
  },
  type: {
    type: "string",
    readOnly: true,
    default: DataType.ChatRobot,
    readonly: true,
  },
  model: {
    type: "enum",
    values: Object.values(ModelPriceEnum),
  },
  replyRule: {
    type: "textarea",
    min: 1,
    optional: true,
  },
  knowledge: {
    type: "textarea",
    min: 1,
    optional: true,
  },
  path: {
    type: "string",
    min: 1,
    optional: true,
  },
};
//for dialog create
export const createDsl = {
  name: {
    type: "string",
    min: 1,
  },
  description: {
    type: "textarea",
    min: 1,
  },

  replyRule: {
    type: "textarea",
    min: 1,
    optional: true,
  },
  knowledge: {
    type: "textarea",
    min: 1,
    optional: true,
  },
  model: {
    type: "enum",
    values: Object.keys(ModelPriceEnum),
  },
  path: {
    type: "string",
    min: 1,
    optional: true,
  },
};

const editDsl = {
  name: {
    type: "string",
    min: 1,
  },
  description: {
    type: "textarea",
    min: 1,
  },

  replyRule: {
    type: "textarea",
    min: 1,
    optional: true,
  },
  knowledge: {
    type: "textarea",
    min: 1,
    optional: true,
  },
  model: {
    type: "enum",
    values: Object.keys(ModelPriceEnum),
  },
  path: {
    type: "string",
    min: 1,
    optional: true,
  },
};

export const schema = createZodSchemaFromDSL(dsl);
export const fields = createFieldsFromDSL(dsl);
export const createSchema = createZodSchemaFromDSL(createDsl);
export const createFields = createFieldsFromDSL(createDsl);

export const editSchema = createZodSchemaFromDSL(editDsl);
export const editFields = createFieldsFromDSL(editDsl);
