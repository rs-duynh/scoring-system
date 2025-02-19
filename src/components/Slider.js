import React, { useEffect, useRef, useState } from 'react';

const Slider = ({ min, max, value, onChange, disabled }) => {
  const sliderRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    const el = sliderRef.current;
    const parent = el.parentNode;
    const ratio = 100 / (max - min);

    const updateTooltip = () => {
      const currentValue = ratio * (el.value - min);
      tooltipRef.current.textContent = el.value;
      parent.style.setProperty('--value', currentValue);
      parent.dataset.value = el.value;
    };

    el.addEventListener('input', updateTooltip);
    updateTooltip(); // Update tooltip when component mounts

    return () => {
      el.removeEventListener('input', updateTooltip);
    };
  }, [min, max]);

  // Update tooltip and slider when value changes
  const [currentValue, setCurrentValue] = useState(0);
  useEffect(() => {
    const el = sliderRef.current;
    const parent = el.parentNode;
    const ratio = 100 / (max - min);
    const currentValue = ratio * (value - min);
    setCurrentValue(currentValue);
    tooltipRef.current.textContent = value;
    parent.style.setProperty('--value', currentValue);
    parent.dataset.value = value;
  }, [value, min, max]);

  return (
    <div className={`slider slider-green w-full md:w-1/3 ${disabled ? 'opacity-50' : ''}`} data-style="green"
    
    >
      <span ref={tooltipRef} className="slider-tooltip"></span>
      <input
        ref={sliderRef}
        className={`slider-range w-full ${disabled ? 'bg-gray-300' : ''}`}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
};

export default Slider; 