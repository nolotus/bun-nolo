export const adjustPerplexityFrequencyPenalty = (
  value: string | number,
): number => {
  let penalty = Number(value);
  penalty = Number.isNaN(penalty) || penalty <= 0 ? 1.0 : penalty; // 如果不大于0，默认设置为1.0
  return penalty;
};
