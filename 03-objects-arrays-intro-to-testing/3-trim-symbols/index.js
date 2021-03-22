/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (string.trim().length === 0 || size === 0) {
    return '';
  }

  if (!size) {
    return string;
  }

  const watcher = {
    count: 0,
    symbol: ''
  };
  let trimmedString = '';

  for (let i = 0; i < string.length; i++) {

    switch (string[i]) {
      case watcher.symbol:
        if (watcher.count < size - 1) {
          trimmedString += string[i];
          watcher.count++;
        }
        break;

      default:
        trimmedString += string[i];
        watcher.count = 0;
        watcher.symbol = string[i];
        break;
    }

  }

  return trimmedString;
}
