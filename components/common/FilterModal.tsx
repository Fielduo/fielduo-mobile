import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { OPERATORS } from './filterOperators';
import { FILTER_CONFIG, FilterField } from './filtersConfig';

/* ================= PLACEHOLDERS (IMPORTANT) ================= */

const FIELD_PLACEHOLDER = '__FIELD__';
const OPERATOR_PLACEHOLDER = '__OPERATOR__';

/* ================= TYPES ================= */

export interface AppliedFilter {
  field: string;
  operator: string;
  value: string;
}

type FilterModule =
  | 'contacts'
  | 'workforce'
  | 'assets'
  | 'inventory'
  | 'vehicle'
  | 'service_contract'
  | 'work_orders'
  | 'field_worker_trips'
  | 'trip_logs'
  | 'service_reports'
  | 'work_completion'
  | 'invoices'
  | 'quotes'
  | 'customer_feedback'
  | 'payments'
  | 'accounts';

interface FilterModalProps {
  visible: boolean;
  module: FilterModule;
  onClose: () => void;
  onApply: (filter: AppliedFilter) => void;
}

/* ================= CONSTANT ================= */

const EMPTY_FILTER: AppliedFilter = {
  field: FIELD_PLACEHOLDER,
  operator: OPERATOR_PLACEHOLDER,
  value: '',
};

/* ================= COMPONENT ================= */

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  module,
  onClose,
  onApply,
}) => {
  const [filter, setFilter] = useState<AppliedFilter>(EMPTY_FILTER);

  /* Reset when modal opens */
  useEffect(() => {
    if (visible) {
      setFilter(EMPTY_FILTER);
    }
  }, [visible]);

  const fields: FilterField[] = FILTER_CONFIG[module];

  const selectedField: FilterField | null =
    filter.field !== FIELD_PLACEHOLDER
      ? fields.find((f) => f.key === filter.field) || null
      : null;

  const handleClose = () => {
    setFilter(EMPTY_FILTER);
    onClose();
  };

  const handleApply = () => {
    if (
      filter.field === FIELD_PLACEHOLDER ||
      filter.operator === OPERATOR_PLACEHOLDER ||
      !filter.value.trim()
    ) {
      return;
    }

    onApply(filter);
    handleClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View
        style={{
          flex: 1,
          backgroundColor: '#00000066',
          justifyContent: 'flex-end',
        }}
      >
        <View
          style={{
            backgroundColor: '#fff',
            margin: 20,
            padding: 16,
            borderRadius: 10,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 10 }}>
            Filter
          </Text>

          {/* ================= FIELD ================= */}
          <View style={{ height: 50, justifyContent: 'center' }}>
            <Picker
              mode="dropdown"
              selectedValue={filter.field}
              onValueChange={(v) =>
                setFilter({
                  field: v,
                  operator: OPERATOR_PLACEHOLDER,
                  value: '',
                })
              }
            >
              <Picker.Item
                label="Select Field"
                value={FIELD_PLACEHOLDER}
                color="#999"
                enabled={false}
              />

              {fields.map((f) => (
                <Picker.Item
                  key={f.key}
                  label={f.label}
                  value={f.key}
                />
              ))}
            </Picker>
          </View>

          {/* ================= OPERATOR ================= */}
          {selectedField && (
            <View
              style={{
                height: 50,
                justifyContent: 'center',
                marginTop: 10,
              }}
            >
              <Picker
                mode="dropdown"
                selectedValue={filter.operator}
                onValueChange={(v) =>
                  setFilter((p) => ({ ...p, operator: v }))
                }
              >
                <Picker.Item
                  label="Select Operator"
                  value={OPERATOR_PLACEHOLDER}
                  color="#999"
                  enabled={false}
                />

                {OPERATORS[selectedField.type].map((op) => (
                  <Picker.Item
                    key={op.value}
                    label={op.label}
                    value={op.value}
                  />
                ))}
              </Picker>
            </View>
          )}

          {/* ================= VALUE ================= */}
          {filter.operator !== OPERATOR_PLACEHOLDER && (
            <TextInput
              placeholder="Enter value"
              value={filter.value}
              onChangeText={(t) =>
                setFilter((p) => ({ ...p, value: t }))
              }
              style={{
                borderWidth: 1,
                borderRadius: 6,
                padding: 10,
                marginTop: 12,
              }}
            />
          )}

          {/* ================= ACTIONS ================= */}
          <View style={{ flexDirection: 'row', marginTop: 20 }}>
            <TouchableOpacity style={{ flex: 1 }} onPress={handleApply}>
              <Text style={{ color: 'green', textAlign: 'center' }}>
                Apply
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={{ flex: 1 }} onPress={handleClose}>
              <Text style={{ color: 'red', textAlign: 'center' }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FilterModal;
