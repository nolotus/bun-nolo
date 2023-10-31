import React from 'react';
import { useTranslation } from 'react-i18next';
import { getLogger } from 'utils/logger';

import { ArrayField } from './ArrayField';
import { DateField } from './DateField';
import { DatetimeField } from './DatetimeField';
import { DurationField } from './DurationField';
import { EnumField } from './EnumField';
import { NumberField } from './NumberField';
import { PasswordField } from './PasswordField';
import { TextAreaField } from './TextAreaField';
import { TextField } from './TextField';
import { TimestampField } from './TimestampField';
import { FormFieldProps } from './type';
import { WeekdayField } from './WeekdayField';

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const i18nLogger = getLogger('i18n');
const formLogger = getLogger('form');
//todos
//deps ,setValueAs,valueAsDate,valueAsNumber,validate,pattern,min,max,minLength,maxLength
export const FormField: React.FC<FormFieldProps> = ({
  id,
  type,
  register,
  errors,
  label,
  options,
  subtype,
  readOnly,
  optional,
  defaultValue,
}) => {
  const { t } = useTranslation();
  const translatedLabel = capitalizeFirstLetter(t(label));
  i18nLogger.info({ label, translatedLabel }, 'Translated label');

  let FieldComponent;
  switch (type) {
    case 'time':
      switch (subtype) {
        case 'date':
          FieldComponent = (
            <DateField
              id={id}
              register={register}
              label={translatedLabel}
              readOnly={readOnly}
            />
          );
          break;
        case 'timestamp':
          FieldComponent = (
            <TimestampField
              id={id}
              register={register}
              label={translatedLabel}
            />
          );
          break;
        case 'duration':
          FieldComponent = (
            <DurationField
              id={id}
              register={register}
              label={translatedLabel}
            />
          );
          break;
        case 'weekday':
          FieldComponent = (
            <WeekdayField id={id} register={register} label={translatedLabel} />
          );
          break;
        case 'datetime':
          FieldComponent = (
            <DatetimeField
              id={id}
              register={register}
              label={translatedLabel}
            />
          );
          break;
        default:
          FieldComponent = null;
      }
      break;
    case 'textarea':
      FieldComponent = (
        <TextAreaField
          optional={optional}
          id={id}
          register={register}
          label={translatedLabel}
        />
      );
      break;

    case 'string':
      FieldComponent = (
        <TextField
          id={id}
          optional={optional}
          register={register}
          label={translatedLabel}
          readOnly={readOnly}
          defaultValue={defaultValue}
        />
      );
      break;
    case 'number':
      FieldComponent = (
        <NumberField id={id} register={register} label={translatedLabel} />
      );
      break;
    case 'password':
      FieldComponent = (
        <PasswordField id={id} register={register} label={translatedLabel} />
      );
      break;
    case 'enum':
      FieldComponent = (
        <EnumField
          id={id}
          register={register}
          label={translatedLabel}
          options={options}
        />
      );
      break;
    case 'array':
      FieldComponent = (
        <ArrayField
          id={id}
          register={register}
          label={translatedLabel}
          options={options}
        />
      );
      break;
    default:
      FieldComponent = null;
  }

  return (
    <div className="mb-4">
      {FieldComponent}
      {errors && errors[id] && (
        <p className="text-red-500 text-sm mt-2 mb-2">
          {String(errors[id].message)}
        </p>
      )}
    </div>
  );
};
// 考虑文本，数字  文件和媒体，地理信息，逻辑状态， 复杂类型
// map: 键值对。
// tuple: 元组。
// union: 联合类型。
// intersection: 交叉类型。
