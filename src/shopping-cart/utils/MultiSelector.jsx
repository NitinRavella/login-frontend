import React from 'react';
import { FormGroup, Label, Input } from 'reactstrap';

const MultiSelectWithOther = ({
    label,
    icon: Icon,
    name,
    options = [],
    selectedValues = [],
    otherInput = '',
    onChange,
    onOtherInputChange
}) => {
    const isOtherActive = selectedValues.includes('Other');

    const handleCheckboxChange = (value) => {
        if (value === 'Other') {
            // Toggle Other selection
            if (isOtherActive) {
                const newValues = selectedValues.filter(v => v !== 'Other');
                onChange(newValues);
                // Clear input when "Other" is deselected
                onOtherInputChange('');
            } else {
                onChange([...selectedValues, 'Other']);
            }
        } else {
            const newValues = selectedValues.includes(value)
                ? selectedValues.filter(v => v !== value)
                : [...selectedValues, value];
            onChange(newValues);
        }
    };
    console.log('MulitiSelect With other', selectedValues, otherInput)
    return (
        <FormGroup>
            <Label className="fw-semibold d-flex align-items-center gap-1">
                {Icon && <Icon />} {label}
            </Label>
            <div className="d-flex flex-wrap gap-3 p-3 border rounded bg-white">
                {options.map((option, idx) => (
                    <div key={idx} className="form-check">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id={`${name}_${option}`}
                            checked={selectedValues.includes(option)}
                            onChange={() => handleCheckboxChange(option)}
                        />
                        <label className="form-check-label" htmlFor={`${name}_${option}`}>
                            {option}
                        </label>
                    </div>
                ))}
                {/* Other option */}
                <div className="form-check d-flex align-items-center gap-2">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id={`${name}_other`}
                        checked={isOtherActive}
                        onChange={() => handleCheckboxChange('Other')}
                    />
                    <label className="form-check-label" htmlFor={`${name}_other`}>
                        Other
                    </label>
                    <input
                        type="text"
                        className="form-control form-control-sm"
                        id={`${name}_other_input`}
                        placeholder="e.g. 25GB, 50GB"
                        value={otherInput}
                        onChange={(e) => onOtherInputChange(e.target.value)}
                        disabled={!isOtherActive}
                        style={{ maxWidth: 200 }}
                    />
                </div>
            </div>
        </FormGroup>
    );
};

export default MultiSelectWithOther;
