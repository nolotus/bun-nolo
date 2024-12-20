import { useAppSelector } from "app/hooks";
import { useQueryData } from "app/hooks/useQueryData";
import { DataType } from "create/types";
import { selectFilteredDataByUserAndType } from "database/selectors";
import type React from "react";
import { defaultTheme } from "render/styles/colors";
import CybotBlock from "./CybotBlock";

interface CybotsProps {
	queryUserId: string;
	limit?: number;
	closeModal?: () => void;
}

const styles = {
	loadingContainer: {
		textAlign: "center" as const,
		padding: "1.5rem",
		color: defaultTheme.textSecondary,
		fontSize: "1rem",
	},
	gridContainer: {
		display: "grid",
		gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
		gap: "1.5rem",
		padding: "0.8rem",
		margin: "0 auto",
		maxWidth: "1200px",
	},
};

const Cybots: React.FC<CybotsProps> = ({
	queryUserId,
	limit = 20,
	closeModal,
}) => {
	const queryConfig = {
		queryUserId,
		options: {
			isJSON: true,
			limit,
			condition: {
				type: DataType.Cybot,
			},
		},
	};

	const { isLoading, isSuccess } = useQueryData(queryConfig);

	const data = useAppSelector(
		selectFilteredDataByUserAndType(queryUserId, DataType.Cybot),
	);

	if (isLoading) {
		return (
			<div style={styles.loadingContainer}>
				<div className="fadeIn">加载 AI 列表中...</div>
			</div>
		);
	}

	return (
		<div className="fadeIn" style={styles.gridContainer}>
			{isSuccess &&
				data?.map((item) => (
					<div key={item.id} className="slideInUp">
						<CybotBlock item={item} closeModal={closeModal} />
					</div>
				))}
		</div>
	);
};

export default Cybots;
