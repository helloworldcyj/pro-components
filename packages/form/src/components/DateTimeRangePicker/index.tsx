import React from 'react';
// eslint-disable-next-line import/no-unresolved
import ProField from '@ant-design/pro-field';
import { Form } from 'antd';
import { DatePickerProps } from 'antd/lib/date-picker';
import { ProFormItemProps } from '../../interface';
import { createField } from '../../BaseForm';

/**
 * 日期时间区间选择组件
 * @param
 */
const ProFormDateTimeRangePicker: React.FC<ProFormItemProps & DatePickerProps> = ({
  value,
  fieldProps,
  ...restProps
}) => {
  return (
    <Form.Item {...restProps}>
      <ProField text={value} mode="edit" formItemProps={fieldProps} valueType="dateTime" />
    </Form.Item>
  );
};

export default createField<ProFormItemProps & DatePickerProps>(ProFormDateTimeRangePicker);
