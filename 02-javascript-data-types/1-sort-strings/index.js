/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const arrCopy = [...arr];

  return arrCopy.sort((a, b) =>
    param === 'desc' ?
    compareStrings(b, a) :
    compareStrings(a, b)
  );
}

function compareStrings(a, b) {
  const locales = ['ru-u-kf-upper', 'en-u-kf-upper'];
  const options = {
    sensitivity: 'variant'
  };

  return a.localeCompare(b, locales, options);
}
