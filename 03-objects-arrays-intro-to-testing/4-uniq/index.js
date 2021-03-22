/**
 * uniq - returns array of uniq values:
 * @param {*[]} arr - the array of primitive values
 * @returns {*[]} - the new array with uniq values
 */
export function uniq(arr) {
  const uniqueArr = [];
  const uniqueValues = new Set(arr).values();

  for (const value of uniqueValues) {
    uniqueArr.push(value);
  }

  return uniqueArr;
}
