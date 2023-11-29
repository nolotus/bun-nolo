export const validateAndTransformOpenAIFrequencyPenalty = (value: any) => {
  const penalty = Number(value);
  if (isNaN(penalty) || penalty < -2.0 || penalty > 2.0) {
    throw new Error(
      'OpenAI model frequency_penalty must be a number between -2.0 and 2.0.',
    );
  }
  return penalty;
};
