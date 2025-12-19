// E:\user\fielduo-mobile\components\common\filterOperators.ts

export type FilterFieldType = 'text' | 'number' | 'date';

export interface Operator {
  label: string;
  value: string;
}

/**
 * ✅ Always show same 4 operators for all field types
 */
const COMMON_OPERATORS: Operator[] = [
  { label: 'Contains', value: 'contains' },
  { label: '=', value: '=' },
  { label: '>', value: '>' },
  { label: '<', value: '<' },
];

export const OPERATORS: Record<FilterFieldType, Operator[]> = {
  text: COMMON_OPERATORS,
  number: COMMON_OPERATORS,
  date: COMMON_OPERATORS,
};
