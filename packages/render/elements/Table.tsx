import { defaultTheme } from "render/styles/colors";

interface TableBaseProps {
	attributes?: any;
	children: React.ReactNode;
	theme?: typeof defaultTheme;
	style?: React.CSSProperties;
}

export const Table: React.FC<TableBaseProps> = ({
	attributes,
	children,
	theme = defaultTheme,
	style,
}) => (
	<table
		style={{
			borderCollapse: "separate",
			borderSpacing: 0,
			width: "100%",
			margin: "1.5em 0",
			background: theme.background,
			color: theme.text,
			borderRadius: "8px",
			boxShadow: `0 1px 3px ${theme.shadowLight}`,
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
	theme = defaultTheme,
	style,
}) => (
	<>
		<style>
			{`
        .table-row {
          border-bottom: 1px solid ${theme.border};
          background: ${theme.background};
          transition: background-color 0.15s ease;
        }
        .table-row:hover {
          background: ${theme.backgroundSecondary};
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
	theme = defaultTheme,
	style,
}) => {
	const Component = element.header ? "th" : "td";

	const cellStyles = {
		padding: "14px 16px",
		fontSize: "0.875rem",
		lineHeight: 1.6,
		letterSpacing: "0.01em",
		color: theme.text,
		borderBottom: `1px solid ${theme.border}`,
		verticalAlign: "middle",
		...(element.header && {
			backgroundColor: theme.backgroundSecondary,
			color: theme.textSecondary,
			fontSize: "0.9375rem",
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
