import { defaultTheme } from "render/styles/colors";

interface TableBaseProps {
	attributes?: any;
	children: React.ReactNode;
	theme?: typeof defaultTheme;
	style?: React.CSSProperties;
}

// 利用defaultTheme定义表格主题
const tableTheme = {
	table: {
		background: defaultTheme.background,
		color: defaultTheme.text,
		borderRadius: "8px",
		boxShadow: `0 1px 3px ${defaultTheme.shadowLight}`,
	},
	row: {
		background: defaultTheme.background,
		hoverBackground: defaultTheme.backgroundSecondary,
		borderColor: defaultTheme.border,
	},
	header: {
		background: defaultTheme.backgroundSecondary,
		color: defaultTheme.textSecondary,
		borderColor: defaultTheme.border,
		fontSize: "0.9375rem",
	},
	cell: {
		padding: "14px 16px",
		borderColor: defaultTheme.borderLight,
		color: defaultTheme.text,
		fontSize: "0.875rem",
	},
};

export const Table: React.FC<TableBaseProps> = ({
	attributes,
	children,
	theme = tableTheme,
	style,
}) => (
	<table
		style={{
			borderCollapse: "separate",
			borderSpacing: 0,
			width: "100%",
			margin: "1.5em 0",
			background: theme.table.background,
			color: theme.table.color,
			borderRadius: theme.table.borderRadius,
			boxShadow: `0 1px 3px ${defaultTheme.shadowLight}`,
			...style,
		}}
		{...attributes}
	>
		{children}
	</table>
);

export const TableRow: React.FC<TableBaseProps> = ({
	attributes,
	children,
	theme = tableTheme,
	style,
}) => (
	<>
		<style>
			{`
        .table-row {
          border-bottom: 1px solid ${defaultTheme.border};
          background: ${defaultTheme.background};
          transition: background-color 0.15s ease;
        }
        .table-row:hover {
          background: ${defaultTheme.backgroundSecondary};
        }
      `}
		</style>
		<tr className="table-row" style={style} {...attributes}>
			{children}
		</tr>
	</>
);

interface TableCellProps extends TableBaseProps {
	element: {
		header?: boolean;
	};
}

export const TableCell: React.FC<TableCellProps> = ({
	attributes,
	children,
	element,
	theme = tableTheme,
	style,
}) => {
	const Component = element.header ? "th" : "td";

	const cellStyles = {
		padding: theme.cell.padding,
		fontSize: theme.cell.fontSize,
		lineHeight: 1.6,
		letterSpacing: "0.01em",
		color: defaultTheme.text,
		borderBottom: `1px solid ${defaultTheme.border}`,
		verticalAlign: "middle",
		...(element.header && {
			backgroundColor: defaultTheme.backgroundSecondary,
			color: defaultTheme.textSecondary,
			fontSize: theme.header.fontSize,
			fontWeight: 600,
			height: "48px",
			textAlign: "left" as const,
			whiteSpace: "nowrap" as const,
		}),
		...style,
	};

	return (
		<Component style={cellStyles} {...attributes}>
			{children}
		</Component>
	);
};
