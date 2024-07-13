import { createFieldsFromDSL } from "render/ui/Form/createFieldsFromDSL";
import { createZodSchemaFromDSL } from "database/schema/createZodSchemaFromDSL";

import { modelEnum } from "./models";
import { DataType } from "create/types";
const baseFields = {
  name: {
    type: "string",
    min: 1,
  },
  description: {
    type: "textarea",
    min: 1,
  },
  model: {
    type: "enum",
    values: Object.values(modelEnum),
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

// 专门为页面创建定义的字段
export const dsl = {
  ...baseFields,
  type: {
    type: "string",
    readOnly: true,
    default: DataType.ChatRobot,
    readonly: true,
  },
};
export const createDsl = { ...baseFields };
export const editDsl = { ...baseFields };

export const schema = createZodSchemaFromDSL(dsl);
export const fields = createFieldsFromDSL(dsl);
export const createSchema = createZodSchemaFromDSL(createDsl);
export const createFields = createFieldsFromDSL(createDsl);

export const editSchema = createZodSchemaFromDSL(editDsl);
export const editFields = createFieldsFromDSL(editDsl);
