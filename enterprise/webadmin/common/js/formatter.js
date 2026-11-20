const Decimal = require('decimal.js');

function formatLocaleStr(num, decimalPlace = 0) {
  if (num === null || num === undefined) return '-';

  const decimalNum = new Decimal(num || 0);
  const numStr = decimalNum.toFixed(decimalPlace);
  const numArr = numStr.split('.');
  numArr[0] = numArr[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return trimTrailZero(numArr.join('.'));
}

function formatToMaxDigit({ val, maxDigitCount = 8 }) {
  const valStr = String(val);
  const [int = '', decimal = ''] = valStr.split('.');
  const [intDigit, decimalDigitLength] = [int?.length || 1, decimal?.length || 0];
  const totalLength = intDigit + decimalDigitLength;
  if (totalLength <= maxDigitCount) return String(val);
  const remainLength = Math.max(maxDigitCount - intDigit, 0);
  return `${int}.${decimal.slice(0, remainLength)}`;
}

function trimTrailZero(numberStr) {
  if (!numberStr || !numberStr.includes('.')) return numberStr;
  const splitNum = numberStr.split('.');
  while (splitNum[1] && splitNum[1][splitNum[1].length - 1] === '0') {
    splitNum[1] = splitNum[1].slice(0, -1);
  }
  return splitNum[1] ? `${splitNum[0]}.${splitNum[1]}` : splitNum[0];
}

function numTransform(value) {
  return isNaN(value) ? 0 : value;
}

function getFirstNonZeroDecimal(s) {
  let str = s;
  if (s.indexOf('e') > 0) {
    str = new Decimal(s).toFixed(new Decimal(s).decimalPlaces());
  }
  const stringNumberRegex = /(-?)([\d,_]*)\.?(\d*)/;
  const [, , , dec = ''] = str.match(stringNumberRegex) || [];
  const index = dec.split('').findIndex((c) => Number(c) > 0);
  return index + 1;
}

function trimTailingZero(s) {
  if (!s.includes('.')) return s;
  const stringNumberRegex = /(-?)([\d,_]*)\.?(\d*)/;
  const [, sign, int, dec] = s.match(stringNumberRegex) || [];
  let cleanedDecimalPart = dec;
  while (cleanedDecimalPart.endsWith('0')) {
    cleanedDecimalPart = cleanedDecimalPart.slice(0, -1);
  }
  return cleanedDecimalPart ? `${sign}${int}.${cleanedDecimalPart}` : `${sign}${int}` || '0';
}

const userLocale = 'en-US'; // Node.js does not have navigator object

const detectedSeparator = new Intl.NumberFormat(userLocale, {
  style: 'decimal'
})
  .format(1.1)
  .substring(1, 2);

function formatToRawLocaleStr(val) {
  if (!val) {
    return '';
  }
  return detectedSeparator !== '.' ? val.toString().replace('.', detectedSeparator) : val;
}

function formatCurrencyOverride(formattedCurrency, maximumDecimalTrailingZeroes) {
  if (maximumDecimalTrailingZeroes !== undefined) {
    formattedCurrency = decimalTrailingZeroesToExponent(formattedCurrency, maximumDecimalTrailingZeroes);
  }
  return formattedCurrency;
}

function generateIntlNumberFormatter(symbol, abbreviated, numDecimals = 2) {
  const params = {
    style: 'decimal',
    useGrouping: true,
    minimumFractionDigits: 0,
    maximumFractionDigits: numDecimals
  };
  const formatter = new Intl.NumberFormat(userLocale, params);

  return {
    format: (value) => {
      let formattedValue = formatter.format(value);
      if (abbreviated) {
        const matches = formatWithAbbreviation(value, numDecimals).match(/^(\d+(?:\.\d+)?)([TBMK]?)$/);
        if (matches) {
          const [, numericPart, sign] = matches;
          formattedValue = `${formatter.format(parseFloat(numericPart))}${sign}`;
        }
      }
      return symbol ? `${symbol}${formattedValue}` : formattedValue;
    }
  };
}

function formatCurrency(amount, params = {}) {
  const { noDecimal = false, symbol, abbreviated = false, decimalPlaces, maximumDecimalTrailingZeroes } = params;
  if (!amount) {
    return symbol ? `${symbol}0` : '0';
  }
  const amountDecimal = amount instanceof Decimal ? amount : new Decimal(String(amount).replace(/,/gi, ''));
  const amountNumber = amountDecimal.toNumber();
  const amountString = amountDecimal.toFixed();
  const currencyFormatterNoDecimal = generateIntlNumberFormatter(symbol, abbreviated, 0);

  if (noDecimal === true && amountNumber > 1) {
    return formatCurrencyOverride(currencyFormatterNoDecimal.format(amountNumber));
  }
  if (decimalPlaces !== undefined) {
    const currencyFormatterCustom = generateIntlNumberFormatter(symbol, abbreviated, decimalPlaces);
    return formatCurrencyOverride(currencyFormatterCustom.format(amountNumber), maximumDecimalTrailingZeroes);
  }

  if (amountNumber === 0.0) {
    return amountNumber.toFixed(0);
  } else if (amountNumber >= 1000) {
    return formatCurrencyOverride(currencyFormatterNoDecimal.format(amountNumber));
  } else if (amountNumber >= 50 && amountNumber < 1000) {
    const currencyFormatterMedium = generateIntlNumberFormatter(symbol, abbreviated, 3);
    return formatCurrencyOverride(currencyFormatterMedium.format(amountNumber), maximumDecimalTrailingZeroes);
  } else if (amountNumber >= 0.000001 && amountNumber < 50) {
    const currencyFormatterSmall = generateIntlNumberFormatter(symbol, abbreviated, 6);
    return formatCurrencyOverride(currencyFormatterSmall.format(amountNumber), maximumDecimalTrailingZeroes);
  } else if (amountNumber >= 10 ** -9 && amountNumber < 10 ** -6) {
    const currencyFormatterVeryVerySmall = generateIntlNumberFormatter(symbol, abbreviated, 12);
    return formatCurrencyOverride(
      currencyFormatterVeryVerySmall.format(formatSmallNumberWithFixed(amountNumber, 3)),
      maximumDecimalTrailingZeroes
    );
  } else {
    const digitsAfterPoint = amountString.length - 2;
    const currencyFormatterTooSmall = generateIntlNumberFormatter(
      symbol,
      abbreviated,
      digitsAfterPoint
    );
    return formatCurrencyOverride(
      currencyFormatterTooSmall.format(formatSmallNumberWithFixed(amountNumber, 3)),
      maximumDecimalTrailingZeroes
    );
  }
}

function formatWithAbbreviation(value, numDecimals) {
  const thresholds = [
    { sign: 'T', value: 1e12 },
    { sign: 'B', value: 1e9 },
    { sign: 'M', value: 1e6 },
    { sign: 'K', value: 1e3 }
  ];
  for (let i = 0; i < thresholds.length; i++) {
    if (value >= thresholds[i].value) {
      const abbreviatedValue = trimTrailZero((value / thresholds[i].value).toFixed(numDecimals));
      return `${abbreviatedValue}${thresholds[i].sign}`;
    }
  }
  return trimTrailZero(value.toFixed(numDecimals)) || '';
}

function decimalTrailingZeroesToExponent(formattedCurrency, maximumDecimalTrailingZeroes) {
  const decimalTrailingZeroesPattern = new RegExp(`(\\.|,)(0{${maximumDecimalTrailingZeroes + 1},})(?=[1-9]?)`);
  return formattedCurrency.replace(
    decimalTrailingZeroesPattern,
    (_match, separator, decimalTrailingZeroes) => `${separator}0${toSubscript(decimalTrailingZeroes.length)}`
  );
}

function formatSmallNumberWithFixed(number, fixedDigits) {
  const [base, exponent] = number.toExponential().split('e');
  const baseFixed = parseFloat(base).toFixed(fixedDigits);
  return parseFloat(`${baseFixed}e${exponent}`);
}

function toSubscript(number) {
  const subscriptNumbers = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
  return number
    .toString()
    .split('')
    .map((digit) => subscriptNumbers[parseInt(digit, 10)])
    .join('');
}

module.exports = {
  formatLocaleStr,
  formatToMaxDigit,
  trimTrailZero,
  numTransform,
  getFirstNonZeroDecimal,
  trimTailingZero,
  formatToRawLocaleStr,
  formatCurrency
};
