const getPaginationData = (
  startIndex: number,
  page: number,
  limit: number,
  total: number
) => {
  const pagination = {
    skipped: 0,
    current: 0,
    total: 0,
  };

  if (startIndex > 0) {
    pagination.skipped = Math.ceil(startIndex / limit);
  }
  pagination.current = page;
  pagination.total = Math.ceil(total / limit);

  return pagination;
};

export default getPaginationData;
