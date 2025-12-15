export const formatVND = (value: number): string => {
  const n = Number.isFinite(value) ? Math.round(value) : 0;
  return `${n.toLocaleString("vi-VN")}₫`;
};

