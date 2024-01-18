export const adjustOpenAIFrequencyPenalty = (value: any): number => {
	let penalty = Number(value);
	penalty = Number.isNaN(penalty) ? 0 : penalty; // 如果不是数字，默认设置为0
	penalty = Math.max(-2.0, Math.min(penalty, 2.0)); // 限制在-2.0到2.0之间
	return penalty;
};
