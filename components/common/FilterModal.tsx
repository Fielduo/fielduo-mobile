import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { OPERATORS } from './filterOperators';
import { FILTER_CONFIG, FilterField } from './filtersConfig';

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
  | 'customer_feedback'   //  ADD THIS
  | 'payments'
  |'accounts';



interface FilterModalProps {
  visible: boolean;
  module: FilterModule;
  onClose: () => void;
  onApply: (filter: AppliedFilter) => void;
}

const EMPTY_FILTER: AppliedFilter = {
  field: '',
  operator: '',
  value: '',
};

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  module,        // ✅ IMPORTANT
  onClose,
  onApply,
}) => {
  const [filter, setFilter] = useState<AppliedFilter>(EMPTY_FILTER);

  /** 🔥 Reset when modal opens */
  useEffect(() => {
    if (visible) {
      setFilter(EMPTY_FILTER);
    }
  }, [visible]);

  const fields: FilterField[] = FILTER_CONFIG[module];

  const selectedField = fields.find(
    (f: FilterField) => f.key === filter.field
  );

  const handleClose = () => {
    setFilter(EMPTY_FILTER);
    onClose();
  };

  const handleApply = () => {
    if (!filter.field || !filter.operator || !filter.value) return;
    onApply(filter);
    handleClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: '#00000066', justifyContent: 'center' }}>
        <View style={{ backgroundColor: '#fff', margin: 20, padding: 16, borderRadius: 10 }}>

          <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 10 }}>
            Filter
          </Text>

          {/* FIELD */}
          <Picker
            selectedValue={filter.field}
            onValueChange={(v) =>
              setFilter({ field: v, operator: '', value: '' })
            }
          >
            <Picker.Item label="Select Field" value="" />
            {fields.map((f: FilterField) => (
              <Picker.Item key={f.key} label={f.label} value={f.key} />
            ))}
          </Picker>

          {/* OPERATOR */}
          {selectedField && (
            <Picker
              selectedValue={filter.operator}
              onValueChange={(v) =>
                setFilter((p) => ({ ...p, operator: v }))
              }
            >
              <Picker.Item label="Select Operator" value="" />
              {OPERATORS[selectedField.type].map((op) => (
                <Picker.Item
                  key={op.value}
                  label={op.label}
                  value={op.value}
                />
              ))}
            </Picker>
          )}

          {/* VALUE */}
          {filter.operator !== '' && (
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
                marginTop: 10,
              }}
            />
          )}

          {/* ACTIONS */}
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
