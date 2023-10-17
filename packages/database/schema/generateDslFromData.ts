export function generateDslFromData(
  data: any[],
  enumFields: string[] = [],
): any {
  const dsl: any = {};

  for (let obj of data) {
    for (let key in obj) {
      let value = obj[key];

      let type = typeof value;
      if (type === 'number') {
        type = Number.isInteger(value) ? 'integer' : 'float';
      } else if (type === 'string') {
        if (enumFields.includes(key)) {
          if (dsl[key]) {
            if (!dsl[key].values.includes(value)) {
              dsl[key].values.push(value);
            }
          } else {
            dsl[key] = {type: 'enum', values: [value]};
          }
        } else {
          type = 'string';
        }
      }

      if (!dsl[key]) {
        dsl[key] = {type};
      }
    }
  }

  return dsl;
}
