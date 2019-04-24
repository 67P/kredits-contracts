function pageNumber(number, size, recordCount) {
  let numberOfPages = Math.ceil(recordCount / size);

  number = parseInt(number) || 1;

  // Ensure page number is in range
  number = number < 1 ? 1 : number;
  number = number > numberOfPages ? numberOfPages : number;

  return number;
}

function buildIds(order, number, size, recordCount) {
  let offset = size * (number - 1);

  let start;
  let mapFunction;

  if (order === 'asc') {
    start = 1 + offset;
    mapFunction = (_, i) => start + i;
  } else {
    start = recordCount - offset;
    mapFunction = (_, i) => start - i;
  }

  // Ensure size is in range
  let end = offset + size;
  if (end > recordCount) {
    let diff = end - recordCount;
    size = size - diff;
  }

  return Array.from({ length: size }, mapFunction);
}

module.exports = function paged(recordCount, options = {}) {
  let { order, page } = options;
  order = order || 'desc';
  page = page || {};

  let size = parseInt(page.size) || 25;
  let number = pageNumber(page.number, size, recordCount);

  return buildIds(order, number, size, recordCount);
};
