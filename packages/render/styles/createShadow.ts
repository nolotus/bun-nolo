export const createShadow = (color: string, config: {
  border: number;
  blur1: number;
  blur2: number;
  borderHover: number;
  blur1Hover: number;
  blur2Hover: number;
} = {
    border: 0.1,
    blur1: 0.08,
    blur2: 0.06,
    borderHover: 0.15,
    blur1Hover: 0.12,
    blur2Hover: 0.08
  }) => {
  const getRGBA = (alpha: number) => {
    if (color === '#000000') {
      return `rgba(0, 0, 0, ${alpha})`;
    }
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return {
    default: `
      0 0 0 1px ${getRGBA(config.border)},
      0 2px 4px ${getRGBA(config.blur1)},
      0 2px 6px ${getRGBA(config.blur2)}
    `,
    hover: `
      0 0 0 1px ${getRGBA(config.borderHover)},
      0 4px 8px ${getRGBA(config.blur1Hover)},
      0 4px 12px ${getRGBA(config.blur2Hover)}
    `
  };
};