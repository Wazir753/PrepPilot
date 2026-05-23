import React from 'react';
import PropTypes from 'prop-types';
import { CODING_LANGUAGES } from '../../utils/constants';
import Select from '../common/Select';

function LanguageSelector({ value, onChange }) {
  const options = CODING_LANGUAGES.map((lang) => ({
    value: lang.value,
    label: lang.label,
  }));

  return (
    <Select
      label="Language"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      options={options}
    />
  );
}

LanguageSelector.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default LanguageSelector;
