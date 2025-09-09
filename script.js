// GLOBAL VARIABLES
const btnCalc = document.querySelector('.btn-calc');
const inputs = document.querySelectorAll('input[type="number"]');
const imageContainer = document.getElementById('imageContainer');
const resultsContainer = document.getElementById('resultsContainer');
let updateInterval;

// UTILITY FUNCTIONS

/**
 * Shows results section and hides image
 */
function showResults() {
  if (imageContainer && resultsContainer) {
    imageContainer.style.display = 'none';
    resultsContainer.classList.add('show');
  }
}

/**
 * Shows image section and hides results
 */
function hideResults() {
  if (imageContainer && resultsContainer) {
    imageContainer.style.display = 'flex';
    resultsContainer.classList.remove('show');
    clearInterval(updateInterval);
  }
}

/**
 * Enhanced date validation with comprehensive checks
 * @param {number} day - Day of the month
 * @param {number} month - Month (1-12)
 * @param {number} year - Full year
 * @returns {boolean} - True if date is valid
 */
function isValidDate(day, month, year) {
  // Check for missing values
  if (!day || !month || !year) return false;

  // Basic range checks
  if (day < 1 || day > 31) return false;
  if (month < 1 || month > 12) return false;
  if (year < 1900 || year > 2500) return false;

  // Create date object and validate it exists
  const date = new Date(year, month - 1, day);
  const isValid = date &&
    date.getFullYear() === year &&
    date.getMonth() + 1 === month &&
    date.getDate() === day;

  return isValid;
}

/**
 * Displays error message for specific input field
 * @param {string} inputId - ID of the input field
 * @param {string} message - Error message to display
 */
function showError(inputId, message) {
  const input = document.getElementById(inputId);
  const errorDiv = document.getElementById(inputId + '-error');

  if (input && errorDiv) {
    input.classList.add('error');
    errorDiv.textContent = message;
    errorDiv.classList.add('show');

    // Auto-clear error after 4 seconds
    setTimeout(() => {
      input.classList.remove('error');
      errorDiv.classList.remove('show');
    }, 4000);
  }
}

/**
 * Clears all error states and messages
 */
function clearErrors() {
  inputs.forEach(input => {
    input.classList.remove('error');
    const errorDiv = document.getElementById(input.id + '-error');
    if (errorDiv) {
      errorDiv.classList.remove('show');
      errorDiv.textContent = '';
    }
  });
}

/**
 * Comprehensive input validation
 * @param {number} bday - Birth day
 * @param {number} bmonth - Birth month
 * @param {number} byear - Birth year
 * @param {number} dday - Death day
 * @param {number} dmonth - Death month
 * @param {number} dyear - Death year
 * @returns {boolean} - True if all inputs are valid
 */
function validateInputs(bday, bmonth, byear, dday, dmonth, dyear) {
  clearErrors();
  let isValid = true;

  // Validate birth date
  if (!isValidDate(bday, bmonth, byear)) {
    showError('bday', 'Invalid birth date');
    isValid = false;
  }

  // Validate death date
  if (!isValidDate(dday, dmonth, dyear)) {
    showError('dday', 'Invalid death date');
    isValid = false;
  }

  if (isValid) {
    const birthDate = new Date(byear, bmonth - 1, bday);
    const deathDate = new Date(dyear, dmonth - 1, dday);
    const now = new Date();

    // Check if birth date is in the future
    if (birthDate > now) {
      showError('byear', 'Birth date cannot be in the future');
      isValid = false;
    }

    // Check if death date is before birth date
    if (deathDate <= birthDate) {
      showError('dyear', 'Death date must be after birth date');
      isValid = false;
    }

    // Check if death date is too close to birth date (less than 1 year)
    const oneYear = 365 * 24 * 60 * 60 * 1000; // milliseconds in a year
    if (deathDate - birthDate < oneYear) {
      showError('dyear', 'Life span must be at least 1 year');
      isValid = false;
    }
  }

  return isValid;
}

/**
 * Main calculation function for life statistics
 * @param {number} bday - Birth day
 * @param {number} bmonth - Birth month
 * @param {number} byear - Birth year
 * @param {number} dday - Death day
 * @param {number} dmonth - Death month
 * @param {number} dyear - Death year
 * @returns {Object|null} - Life statistics or null if invalid
 */
function calcLife(bday, bmonth, byear, dday, dmonth, dyear) {
  if (!validateInputs(bday, bmonth, byear, dday, dmonth, dyear)) {
    return null;
  }

  const birth = new Date(byear, bmonth - 1, bday);
  const death = new Date(dyear, dmonth - 1, dday);
  const now = new Date();

  // Calculate time lived and remaining
  const lived = Math.max(0, now - birth);
  const remaining = Math.max(0, death - now);
  const totalLife = death - birth;

  // Calculate percentage with proper bounds
  let percentageLived = (lived / totalLife) * 100;
  percentageLived = Math.min(100, Math.max(0, percentageLived));
  percentageLived = Math.round(percentageLived * 100) / 100;

  return { lived, remaining, percentageLived, totalLife };
}

/**
 * Converts milliseconds to human-readable time units
 * @param {number} ms - Milliseconds to convert
 * @returns {Object} - Object with years, months, days, hr, min, sec
 */
function formatDuration(ms) {
  // Ensure non-negative value
  ms = Math.max(0, ms);

  let seconds = Math.floor(ms / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  let days = Math.floor(hours / 24);
  let years = Math.floor(days / 365);
  let months = Math.floor((days % 365) / 30);

  // Calculate remainders
  days = days % 30;
  hours = hours % 24;
  minutes = minutes % 60;
  seconds = seconds % 60;

  return {
    years: Math.max(0, years),
    months: Math.max(0, months),
    days: Math.max(0, days),
    hr: Math.max(0, hours),
    min: Math.max(0, minutes),
    sec: Math.max(0, seconds)
  };
}

/**
 * Updates the display with calculation results
 * @param {Object} life - Life calculation results
 */
function showResult(life) {
  if (!life) {
    alert('Please enter valid dates!');
    return;
  }

  const lived = formatDuration(life.lived);
  const remaining = formatDuration(life.remaining);

  // Update lived time elements with safe assignment
  const livedElements = {
    'lived-years': lived.years,
    'lived-months': lived.months,
    'lived-days': lived.days,
    'lived-hours': lived.hr,
    'lived-minutes': lived.min,
    'lived-seconds': lived.sec
  };

  Object.entries(livedElements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  });

  // Update remaining time elements with safe assignment
  const remainingElements = {
    'remaining-years': remaining.years,
    'remaining-months': remaining.months,
    'remaining-days': remaining.days,
    'remaining-hours': remaining.hr,
    'remaining-minutes': remaining.min,
    'remaining-seconds': remaining.sec
  };

  Object.entries(remainingElements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  });

  // Update progress bar with safe assignment
  const progressFill = document.getElementById('progress-fill');
  const progressText = document.getElementById('progress-text');

  if (progressFill && progressText) {
    progressFill.style.width = life.percentageLived + '%';
    progressText.textContent = life.percentageLived + '% Complete';
  }

  showResults();
  startLiveUpdate();
}

/**
 * Starts the live update interval for real-time seconds counting
 */
function startLiveUpdate() {
  clearInterval(updateInterval);

  updateInterval = setInterval(() => {
    try {
      const bday = parseInt(document.getElementById('bday').value);
      const bmonth = parseInt(document.getElementById('bmonth').value);
      const byear = parseInt(document.getElementById('byear').value);
      const dday = parseInt(document.getElementById('dday').value);
      const dmonth = parseInt(document.getElementById('dmonth').value);
      const dyear = parseInt(document.getElementById('dyear').value);

      // Only update if all values are present
      if (bday && bmonth && byear && dday && dmonth && dyear) {
        const life = calcLife(bday, bmonth, byear, dday, dmonth, dyear);

        if (life) {
          const lived = formatDuration(life.lived);
          const remaining = formatDuration(life.remaining);

          // Update only numeric values to avoid flickering
          const updates = [
            ['lived-years', lived.years],
            ['lived-months', lived.months],
            ['lived-days', lived.days],
            ['lived-hours', lived.hr],
            ['lived-minutes', lived.min],
            ['lived-seconds', lived.sec],
            ['remaining-years', remaining.years],
            ['remaining-months', remaining.months],
            ['remaining-days', remaining.days],
            ['remaining-hours', remaining.hr],
            ['remaining-minutes', remaining.min],
            ['remaining-seconds', remaining.sec]
          ];

          updates.forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element && element.textContent !== value.toString()) {
              element.textContent = value;
              // Add brief highlight effect for seconds
              if (id.includes('seconds')) {
                element.style.color = '#60a5fa';
                setTimeout(() => element.style.color = '#ffffff', 200);
              }
            }
          });

          // Update progress bar
          const progressFill = document.getElementById('progress-fill');
          const progressText = document.getElementById('progress-text');

          if (progressFill && progressText) {
            progressFill.style.width = life.percentageLived + '%';
            progressText.textContent = life.percentageLived + '% Complete';
          }
        }
      }
    } catch (error) {
      console.error('Error in live update:', error);
      clearInterval(updateInterval);
    }
  }, 1000);
}

// EVENT LISTENERS

/**
 * Main calculation button click handler
 */
if (btnCalc) {
  btnCalc.addEventListener('click', () => {
    btnCalc.classList.add('loading');
    btnCalc.textContent = 'Calculating...';

    setTimeout(() => {
      try {
        const bday = parseInt(document.getElementById('bday').value);
        const bmonth = parseInt(document.getElementById('bmonth').value);
        const byear = parseInt(document.getElementById('byear').value);
        const dday = parseInt(document.getElementById('dday').value);
        const dmonth = parseInt(document.getElementById('dmonth').value);
        const dyear = parseInt(document.getElementById('dyear').value);

        const life = calcLife(bday, bmonth, byear, dday, dmonth, dyear);
        showResult(life);
      } catch (error) {
        console.error('Calculation error:', error);
        alert('An error occurred during calculation. Please check your inputs.');
      } finally {
        btnCalc.classList.remove('loading');
        btnCalc.textContent = 'Calculate Life Journey';
      }
    }, 500);
  });
}

/**
 * Input field event listeners
 */
inputs.forEach(input => {
  // Enter key support
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (btnCalc) btnCalc.click();
    }
  });

  // Clear errors on input
  input.addEventListener('input', () => {
    input.classList.remove('error');
    const errorDiv = document.getElementById(input.id + '-error');
    if (errorDiv) {
      errorDiv.classList.remove('show');
    }
  });

  // Auto-format input values
  input.addEventListener('blur', () => {
    const value = parseInt(input.value);
    if (!isNaN(value)) {
      // Auto-pad day and month with leading zeros
      if ((input.id.includes('day') || input.id.includes('month')) && value < 10) {
        input.value = '0' + value;
      }
    }
  });
});

/**
 * Auto-calculation with debouncing
 */
let autoCalcTimeout;
inputs.forEach(input => {
  input.addEventListener('input', () => {
    clearTimeout(autoCalcTimeout);
    autoCalcTimeout = setTimeout(() => {
      // Only auto-calculate if all fields have values
      if (Array.from(inputs).every(inp => inp.value.trim() !== '')) {
        if (btnCalc) btnCalc.click();
      }
    }, 2000);
  });
});

/**
 * Cleanup on page unload
 */
window.addEventListener('beforeunload', () => {
  clearInterval(updateInterval);
});

/**
 * Handle page visibility changes to pause/resume updates
 */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    clearInterval(updateInterval);
  } else if (resultsContainer && resultsContainer.classList.contains('show')) {
    startLiveUpdate();
  }
});

// INITIALIZATION
console.log('Life & Death Calculator initialized successfully');
