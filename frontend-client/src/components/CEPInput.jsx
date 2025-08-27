import React from 'react';
import { MapPin, Search } from 'lucide-react';
import { useViaCEP } from '../hooks/useViaCEP';

const CEPInput = ({ 
  value, 
  onChange, 
  onCEPFound, 
  placeholder = "00000-000",
  label = "CEP",
  className = "",
  required = false,
  showNumberField = false,
  numberValue = "",
  onNumberChange = () => {}
}) => {
  const { searchCEP, loading, error, clearError } = useViaCEP();

  const handleInputChange = (e) => {
    onChange(e);
    clearError();
  };

  const handleCEPBlur = async () => {
    if (value && value.length >= 8) {
      const addressData = await searchCEP(value);
      if (addressData && onCEPFound) {
        onCEPFound(addressData);
      }
    }
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && '*'}
      </label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onBlur={handleCEPBlur}
          placeholder={placeholder}
          className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
          ) : (
            <MapPin className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
          <Search className="w-4 h-4" />
          {error}
        </p>
      )}
       
       {/* Campo de Número da Residência */}
       {showNumberField && (
         <div className="mt-3">
           <label className="block text-sm font-medium text-gray-700 mb-2">
             Número *
           </label>
           <input
             type="text"
             value={numberValue}
             onChange={onNumberChange}
             placeholder="123"
             required
             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
           />
         </div>
       )}
     </div>
   );
 };

export default CEPInput;
