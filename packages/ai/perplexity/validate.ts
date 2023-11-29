export const validateAndTransformPerplexityFrequencyPenalty = (value: any) => {
  const penalty = Number(value);
  if (isNaN(penalty) || penalty <= 0) {
    throw new Error(
      'Perplexity model frequency_penalty must be a multiplicative penalty greater than 0.',
    );
  }
  return penalty;
};
