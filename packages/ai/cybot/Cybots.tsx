import { useAppSelector } from "app/hooks";
import { useQueryData } from "app/hooks/useQueryData";
import { selectTheme } from "app/theme/themeSlice";
import { DataType } from "create/types";
import { selectFilteredDataByUserAndType } from "database/selectors";
import type React from "react";
import { useSelector } from "react-redux";
import { BASE_COLORS } from "render/styles/colors";
import CybotBlock from "./CybotBlock";

interface CybotsProps {
	queryUserId: string;
	limit?: number;
	closeModal?: () => void;
}

const Cybots: React.FC<CybotsProps> = ({
	queryUserId,
	limit = 20,
	closeModal,
}) => {
	const theme = useSelector(selectTheme);

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
			<div
				style={{
					textAlign: "center",
					padding: "1.5rem",
					color: BASE_COLORS.light.textSecondary,
					fontSize: "1rem",
				}}
			>
				<div className="fadeIn">加载 AI 列表中...</div>
			</div>
		);
	}

	return (
		<div
			className="fadeIn"
			style={{
				display: "grid",
				gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
				gap: "1.5rem",
				padding: "0.8rem",
				margin: "0 auto",
				maxWidth: "1200px",
			}}
		>
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
