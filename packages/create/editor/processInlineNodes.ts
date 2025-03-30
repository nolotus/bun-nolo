// create/editor/processInlineNodes.ts

// --- Helper Interfaces (Keep or adapt as needed) ---
interface SlateTextNode {
  text: string;
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  // Add other potential inline marks if necessary
}

interface SlateElementNode {
  type: string;
  url?: string;
  alt?: string;
  title?: string;
  html?: string; // For html-inline/html-block
  language?: string; // For code blocks/inline? (Though usually not on inline)
  children: Array<SlateChild>; // Children can be text or other elements
}

type SlateChild = SlateTextNode | SlateElementNode;
type SlateInlineChild = SlateTextNode | SlateElementNode; // Alias for clarity

// --- Helper Functions ---

/**
 * Extracts the tag name from an HTML tag string.
 * e.g., "<span class='foo'>" -> "span", "</p>" -> "p"
 * Returns null if it doesn't look like a tag.
 */
function getTagName(html: string): string | null {
  if (!html || typeof html !== "string") return null;
  const match = html.match(/^<\/?([a-zA-Z0-9]+)/);
  return match ? match[1].toLowerCase() : null;
}

/**
 * Recursively extracts raw text content from an array of mdast nodes.
 */
function getRawTextFromNodes(nodes: any[]): string {
  if (!Array.isArray(nodes)) return "";
  return nodes
    .map((node) => {
      if (!node) return "";
      if (node.type === "text") return node.value || "";
      if (Array.isArray(node.children))
        return getRawTextFromNodes(node.children);
      if (node.value && typeof node.value === "string") return node.value; // Handle nodes like inlineCode
      return "";
    })
    .join("");
}

// --- Main Function ---

/**
 * Processes an array of mdast inline nodes into an array of Slate inline nodes.
 * Handles formatting (strong, emphasis, delete) recursively and merges inline HTML tags.
 * @param mdastChildren Array of mdast nodes.
 * @returns Array of Slate inline nodes.
 */
export function processInlineNodes(mdastChildren: any[]): SlateInlineChild[] {
  if (!Array.isArray(mdastChildren)) {
    return [{ text: "" }];
  }

  const result: SlateInlineChild[] = [];
  // State for tracking open HTML tags
  let activeHtmlTag: {
    startTag: string; // The opening tag string e.g. "<span class='highlight'>"
    tagName: string; // Just the tag name e.g. "span"
    contentNodes: any[]; // mdast nodes collected between start and end tags
  } | null = null;

  try {
    for (let i = 0; i < mdastChildren.length; i++) {
      const child = mdastChildren[i];

      if (!child || typeof child !== "object") {
        // If we are inside an HTML tag, non-object might be text to capture
        if (activeHtmlTag && typeof child === "string") {
          // Treat stray strings as text nodes within the HTML content
          activeHtmlTag.contentNodes.push({ type: "text", value: child });
        }
        continue; // Skip null/undefined/non-object nodes otherwise
      }

      // --- HTML Tag Processing Logic ---
      if (child.type === "html" && typeof child.value === "string") {
        const htmlValue = child.value;
        const tagName = getTagName(htmlValue);

        // 1. Handle Self-Closing Tags
        if (htmlValue.endsWith("/>") && tagName) {
          if (activeHtmlTag) {
            // Self-closing tag inside another tag, add as content
            activeHtmlTag.contentNodes.push(child);
          } else {
            // Standalone self-closing tag
            result.push({
              type: "html-inline",
              html: htmlValue,
              children: [{ text: "" }],
            });
          }
          continue; // Processed this node
        }

        // 2. Handle End Tags
        if (htmlValue.startsWith("</") && tagName) {
          if (activeHtmlTag && activeHtmlTag.tagName === tagName) {
            // Found the matching end tag for the active tag
            const slateContentChildren = processInlineNodes(
              activeHtmlTag.contentNodes
            );
            // Construct the full HTML string (more robustly extract raw text)
            const rawTextContent = getRawTextFromNodes(
              activeHtmlTag.contentNodes
            );
            // The test expects the *full original HTML string* in the `html` prop
            // And the *processed Slate nodes* as `children`
            // Let's adjust to match the test expectation more closely:
            // Generate the slate children first to potentially get text content
            // This part is tricky, the test wants `children` to reflect the *text* content
            // but `html` to be the *full raw html*.

            // Re-evaluate test expectation:
            // html: '<span class="highlight">inline HTML</span>' -> full raw string expected
            // children: [{ text: "inline HTML" }] -> slate representation of content expected

            // Let's try this: Process content first, then assemble html string using raw text extraction.
            const finalSlateChildren =
              slateContentChildren.length > 0
                ? slateContentChildren
                : [{ text: "" }]; // Ensure children is never empty

            result.push({
              type: "html-inline",
              // Combine original start tag, extracted raw text, and original end tag
              html: activeHtmlTag.startTag + rawTextContent + htmlValue,
              children: finalSlateChildren,
            });
            activeHtmlTag = null; // Reset state
          } else {
            // Unmatched or unexpected end tag
            if (activeHtmlTag) {
              // Treat as content within the currently active tag
              activeHtmlTag.contentNodes.push(child);
            } else {
              // Orphaned end tag, treat as text? Or specific html node?
              // Let's treat as text for now to avoid breaking structure.
              result.push({ text: htmlValue });
            }
          }
          continue; // Processed this node
        }

        // 3. Handle Start Tags
        if (!htmlValue.startsWith("</") && tagName) {
          if (activeHtmlTag) {
            // Nested start tag? Treat as content of the outer tag.
            activeHtmlTag.contentNodes.push(child);
          } else {
            // Found a new start tag, begin collecting content
            activeHtmlTag = {
              startTag: htmlValue,
              tagName: tagName,
              contentNodes: [],
            };
          }
          continue; // Processed this node
        }

        // 4. Non-tag HTML (like HTML comments, or malformed) - treat as text?
        // Or if inside a tag, add to content
        if (activeHtmlTag) {
          activeHtmlTag.contentNodes.push(child); // Add as content if inside a tag
        } else {
          result.push({ text: htmlValue }); // Treat as text otherwise
        }
        continue; // Processed
      } // --- End of HTML specific handling ---

      // --- Processing Non-HTML Nodes ---

      // If inside an active HTML tag, collect the node as content
      if (activeHtmlTag) {
        activeHtmlTag.contentNodes.push(child);
        continue; // Don't process further now, wait for end tag
      }

      // If not inside HTML, process other node types normally:
      switch (child.type) {
        case "strong":
          const boldChildren = processInlineNodes(child.children || []);
          boldChildren.forEach((node) => {
            if ("text" in node) {
              (node as SlateTextNode).bold = true;
            }
            // Potentially handle applying bold to nested elements if needed
          });
          result.push(...boldChildren);
          break;

        case "emphasis":
          const italicChildren = processInlineNodes(child.children || []);
          italicChildren.forEach((node) => {
            if ("text" in node) {
              (node as SlateTextNode).italic = true;
            }
          });
          result.push(...italicChildren);
          break;

        case "delete":
          const strikethroughChildren = processInlineNodes(
            child.children || []
          );
          strikethroughChildren.forEach((node) => {
            if ("text" in node) {
              (node as SlateTextNode).strikethrough = true;
            }
          });
          result.push(...strikethroughChildren);
          break;

        case "link":
          result.push({
            type: "link",
            url: child.url || "",
            children: processInlineNodes(child.children || []), // Recursive call for link content
          });
          break;

        case "inlineCode":
          result.push({
            type: "code-inline",
            children: [{ text: child.value || "" }],
          });
          break;

        case "image":
          const imageNode: SlateElementNode = {
            type: "image",
            url: child.url || "",
            alt: child.alt || "",
            children: [{ text: "" }], // Void element
          };
          if (child.title) {
            imageNode.title = child.title;
          }
          result.push(imageNode);
          break;

        case "text":
          // Plain text node, outside of any HTML tag context
          result.push({ text: child.value || "" });
          break;

        // case 'break': // Handle explicit line breaks if needed (<br> in markdown)
        //   result.push({ text: '\n' }); // Or a specific break element type?
        //   break;

        default:
          // Handle unknown inline types - maybe try to extract text?
          if (child.value && typeof child.value === "string") {
            result.push({ text: child.value });
          } else if (Array.isArray(child.children)) {
            // Fallback: process children of unknown nodes? Risky.
            // const unknownChildren = processInlineNodes(child.children);
            // result.push(...unknownChildren);
          }
          // console.log("Unhandled inline node type (outside HTML):", child.type);
          break;
      }
    } // --- End of loop ---

    // After loop: Handle unclosed HTML tag
    if (activeHtmlTag) {
      console.warn(
        "Markdown parsing ended with an unclosed HTML tag:",
        activeHtmlTag.startTag
      );
      // Fallback: Output the start tag as text/html, then process collected content
      result.push({
        type: "html-inline",
        html: activeHtmlTag.startTag,
        children: [{ text: "" }],
      });
      result.push(...processInlineNodes(activeHtmlTag.contentNodes)); // Process collected content separately
    }
  } catch (error) {
    console.warn("Error in processInlineNodes:", error);
    return [{ text: "" }]; // Fallback on error
  }

  // Final check: Ensure result is never empty for Slate
  return result.length > 0 ? result : [{ text: "" }];
}
