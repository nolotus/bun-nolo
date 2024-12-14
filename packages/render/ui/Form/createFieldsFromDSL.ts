export function createFieldsFromDSL(dsl) {
  return Object.keys(dsl).map((key) => ({
    id: key,
    label: key, // 直接使用字段名称，不进行首字母大写
    type: dsl[key].type, // 从 DSL 中获取字段类型
    defaultValue: dsl[key].default, // 从 DSL 中获取默认值
    options: dsl[key].values, // 从 DSL 中获取选项（如果存在）
    readOnly: dsl[key].readOnly,
    optional: dsl[key].optional,
  }));
}
