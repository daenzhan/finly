export const Money = {
    from: (value) => Math.round(Number(value) * 100),
    to: (kopecks) => parseFloat((kopecks / 100).toFixed(2)),
    add: (a, b) => Money.to(Money.from(a) + Money.from(b)),
    subtract: (a, b) => Money.to(Money.from(a) - Money.from(b)),
    multiply: (a, b) => Money.to(Money.from(a) * b),
    divide: (a, b) => Money.to(Money.from(a) / b),
    format: (value) => {
      const num = typeof value === 'number' ? value : parseFloat(value || 0);
      return num.toLocaleString('ru-RU', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    },
    round: (value) => {
      const kopecks = Money.from(value);
      return Money.to(Math.round(kopecks));
    }
    
    
  };