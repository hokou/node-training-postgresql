const isValidString = (value) => {
  return typeof value === 'string' && value.trim() !== '';
}

const isNumber = (value) => {
  return typeof value === 'number' && !isNaN(value);
}


module.exports = {
  isValidString,
  isNumber,
}