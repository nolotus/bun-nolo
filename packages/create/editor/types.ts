export const ParagraphType = "paragraph";
export const CodeBlockType = "code-block";
export const CodeLineType = "code-line";
type FormattedText = { text: string; bold?: true };

export enum HeadingType {
  H1 = "heading-one",
  H2 = "heading-two",
  H3 = "heading-three",
  H4 = "heading-four",
  H5 = "heading-five",
  H6 = "heading-six",
}
export type LinkElement = {
  type: "link";
  url: string;
  children: FormattedText[];
};
