import {
  HomeIcon,
  SignInIcon,
  // GearIcon is implicitly used if CybotNameChip needs it, but not directly here
  PlusIcon, // For Add button in dropdown
  InfoIcon, // Dropdown Trigger
} from "@primer/octicons-react";
import CybotNameChip from "ai/cybot/CybotNameChip"; // Assuming this component exists and handles display/removal UI
import { useAppSelector, useAppDispatch } from "app/hooks"; // Standard Redux hooks
import { RoutePaths } from "auth/web/routes"; // Paths for routing
import { LoggedInMenu } from "auth/web/IsLoggedInMenu"; // Component for logged-in user menu
import { useAuth } from "auth/hooks/useAuth"; // Hook for authentication status
import CreateDialogButton from "chat/dialog/CreateDialogButton"; // Button to create a new dialog
import DeleteDialogButton from "chat/dialog/DeleteDialogButton"; // Button to delete the current dialog
import EditableTitle from "chat/dialog/EditableTitle"; // Component for the dialog title
import {
  selectCurrentDialogConfig, // Selector for current dialog data
  selectTotalDialogTokens, // Selector for token count
  // updateDialog, // Placeholder for potential future Redux action
} from "chat/dialog/dialogSlice"; // Redux slice for dialog state
import type React from "react"; // Base React import
import { useState, useCallback } from "react"; // React hooks for state and memoized callbacks
import type { ReactNode } from "react"; // Type for React children
import { useTranslation } from "react-i18next"; // Hook for internationalization
import { useParams } from "react-router-dom"; // Hook to get URL parameters
import NavListItem from "render/layout/blocks/NavListItem"; // Navigation list item component
import NavIconItem from "./blocks/NavIconItem"; // Navigation icon item component (specific to this structure)
import { selectPageData } from "../page/pageSlice"; // Selector for page data
import { extractUserId } from "core/prefix"; // Utility function
import { CreateTool } from "create/CreateTool"; // Component for page creation tools
import { useTheme } from "app/theme"; // Hook to access theme variables
// Dialog and generic Button are not directly used in this version
// import { Dialog } from "render/web/ui/Dialog";
// import Button from "render/web/ui/Button";

// Interface defining the props for the TopBar component
interface TopBarProps {
  theme: any; // Prop for theme object (can be used alongside useTheme)
  topbarContent?: ReactNode; // Optional prop for additional content in the center
}

// Style constants used within the component
const styles = {
  height: "56px", // Standard height for the top bar
  spacing: "8px", // Standard spacing unit
};

// The main TopBar functional component
const TopBar: React.FC<TopBarProps> = ({
  topbarContent, // Destructure props
}) => {
  // Hooks for translation, auth, Redux dispatch, selectors, theme, and routing params
  const { t } = useTranslation();
  const { isLoggedIn, user } = useAuth();
  const dispatch = useAppDispatch();
  const currentDialogTokens = useAppSelector(selectTotalDialogTokens);
  const currentDialogConfig = useAppSelector(selectCurrentDialogConfig);
  const pageData = useAppSelector(selectPageData);
  const theme = useTheme();
  const { pageKey } = useParams<{ pageKey?: string }>();

  // State hook to manage the visibility of the info dropdown menu
  const [isInfoDropdownOpen, setIsInfoDropdownOpen] = useState(false);

  // Derived constants for logic based on route and user data
  const dataCreator = pageKey ? extractUserId(pageKey) : undefined;
  const isCreator = dataCreator === user?.userId;
  const isNotBelongAnyone = !pageData.creator;
  const allowEdit = isCreator || isNotBelongAnyone;
  const hasPageData =
    pageData.isInitialized && (pageData.content || pageData.slateData);
  const displayEditTool =
    pageKey?.startsWith("page") && allowEdit && hasPageData;

  // Callback to toggle the info dropdown menu's visibility
  const toggleInfoDropdown = useCallback(() => {
    setIsInfoDropdownOpen((prev) => !prev);
  }, []); // Empty dependency array means this callback is created once

  // Callback handler for removing a Cybot (passed to CybotNameChip)
  const handleRemoveCybot = useCallback(
    (cybotIdToRemove: string) => {
      if (!currentDialogConfig) return; // Guard clause if no dialog config
      console.log(
        "TODO: Dispatch action to remove cybot:", // Placeholder log
        cybotIdToRemove,
        "from dialog:",
        currentDialogConfig.id
      );
      // Example Redux dispatch (needs actual implementation):
      // dispatch(updateDialog({
      //   dialogId: currentDialogConfig.id,
      //   changes: { cybots: currentDialogConfig.cybots.filter(id => id !== cybotIdToRemove) }
      // }));
      // Decide whether to close the dropdown upon removal. Currently keeps it open.
    },
    [currentDialogConfig, dispatch] // Dependencies: reruns if config or dispatch changes
  );

  // Callback handler for the "Add Participant" button click
  const handleAddCybotClick = () => {
    console.log(
      "TODO: Open UI to select and add a new cybot to dialog:", // Placeholder log
      currentDialogConfig?.id
    );
    // Close the dropdown when initiating the add action
    // setIsInfoDropdownOpen(false); // Keep it open for now, user might want to see update
    // Placeholder alert, replace with actual UI logic (e.g., open modal)
    alert("Functionality to add a new Cybot is not implemented yet.");
  };

  // Calculate participant count for display
  const participantCount = currentDialogConfig?.cybots?.length ?? 0;

  // JSX rendering for the TopBar component
  return (
    <>
      {/* Main container for the top bar */}
      <div className="topbar">
        {/* Left section of the top bar (e.g., home button) */}
        <div className="topbar-left">
          <NavIconItem path="/" icon={<HomeIcon size={16} />} />
        </div>

        {/* Center section, takes up remaining space */}
        <div className="topbar-center">
          {/* Wrapper for content within the center section */}
          <div className="topbar-content-wrapper">
            {/* Conditionally render dialog-related elements if a dialog is active */}
            {currentDialogConfig && (
              <>
                {/* Editable title for the current dialog */}
                <EditableTitle currentDialogConfig={currentDialogConfig} />

                {/* --- Info Dropdown Area --- */}
                {/* Wrapper for the dropdown trigger and menu */}
                <div className="info-dropdown-wrapper">
                  {/* The InfoIcon button that triggers the dropdown */}
                  <button
                    className="info-dropdown-trigger icon-button"
                    onClick={toggleInfoDropdown} // Toggle dropdown on click
                    aria-expanded={isInfoDropdownOpen} // Accessibility: indicates if dropdown is open
                    aria-controls="info-dropdown-content" // Accessibility: points to the dropdown content ID
                    aria-label={t("Show participants and tokens")} // Accessibility: describes button purpose
                    aria-haspopup="true" // Accessibility: indicates it opens a menu/popup
                  >
                    <InfoIcon size={16} /> {/* The icon itself */}
                  </button>

                  {/* --- Dropdown Menu Content (Conditionally Rendered) --- */}
                  {/* Only render the dropdown menu if isInfoDropdownOpen is true */}
                  {isInfoDropdownOpen && (
                    <div
                      id="info-dropdown-content" // ID for aria-controls linkage
                      className="dropdown-menu" // Styling class for the menu container
                      role="menu" // Accessibility: defines the container as a menu (can be 'region' if not strict menu items)
                    >
                      {/* Section for Participants (Left side on wide screens) */}
                      <div className="dropdown-section participants-section">
                        {/* Header for the participants section */}
                        <h4 className="dropdown-section-header">
                          {t("Participants")} ({participantCount})
                        </h4>
                        {/* Container for the list of Cybot chips */}
                        <div className="cybot-list-dropdown" role="list">
                          {" "}
                          {/* Accessibility: defines as a list */}
                          {/* Conditionally render list or "no participants" text */}
                          {participantCount > 0 ? (
                            // Map over cybot IDs to render chips
                            currentDialogConfig.cybots?.map((cybotId) => (
                              <CybotNameChip
                                key={cybotId} // React key prop
                                cybotId={cybotId} // Pass cybot ID to the chip component
                                onRemove={handleRemoveCybot} // Pass the remove handler
                                className="dropdown-list-item" // Optional class for styling chips within dropdown
                                // role="listitem" // Accessibility: if parent has role="list"
                              />
                            ))
                          ) : (
                            // Text shown when there are no participants
                            <p className="no-participants-text-dropdown">
                              {t("No participants yet.")}
                            </p>
                          )}
                        </div>
                        {/* Button to add a new participant */}
                        <button
                          className="dropdown-item add-participant-button-dropdown"
                          onClick={handleAddCybotClick} // Call handler on click
                          role="menuitem" // Accessibility: defines as a menu item
                        >
                          <PlusIcon size={16} /> {/* Icon for the button */}
                          <span>{t("Add Participant")}</span> {/* Text label */}
                        </button>
                      </div>

                      {/* Divider line between sections (Vertical on wide, Horizontal on narrow) */}
                      <div className="dropdown-divider" role="separator"></div>

                      {/* Section for Token Information (Right side on wide screens) */}
                      <div className="dropdown-section token-section">
                        <h4 className="dropdown-section-header">{t("Info")}</h4>
                        {/* Item displaying the token count */}
                        <div className="dropdown-item token-info-dropdown">
                          <span>{t("Tokens")}:</span>{" "}
                          {/* Separated label for better alignment */}
                          <span>{currentDialogTokens}</span>{" "}
                          {/* Display token count */}
                        </div>
                        {/* Add other info items here if needed */}
                      </div>
                    </div>
                  )}
                </div>
                {/* --- End Dropdown Area --- */}

                {/* Button to create a new dialog */}
                <CreateDialogButton dialogConfig={currentDialogConfig} />
                {/* Button to delete the current dialog */}
                <DeleteDialogButton dialogConfig={currentDialogConfig} />
              </>
            )}
            {/* Conditionally render page creation tools */}
            {displayEditTool && <CreateTool />}
            {/* Render any additional content passed via props */}
            {topbarContent}
          </div>
        </div>

        {/* Right section of the top bar (e.g., login/user menu) */}
        <div className="topbar-right">
          {/* Conditionally render login link or logged-in user menu */}
          {isLoggedIn ? (
            <LoggedInMenu />
          ) : (
            <NavListItem
              label={t("login")}
              icon={<SignInIcon size={16} />}
              path={RoutePaths.LOGIN}
            />
          )}
        </div>
      </div>

      {/* Style block containing all CSS rules for the TopBar and its dropdown */}
      <style>
        {`
          /* --- TopBar Basic Layout --- */
          .topbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: transparent; /* Or specific theme color */
            position: sticky; /* Stick to the top */
            top: 0;
            right: 0;
            width: 100%;
            padding: 12px 16px; /* Vertical and horizontal padding */
            z-index: 2; /* Ensure it's above some other content */
            height: ${styles.height}; /* Fixed height */
            box-sizing: border-box; /* Include padding/border in height */
          }
          .topbar-left {
            display: flex;
            align-items: center;
            gap: ${styles.spacing}; /* Space between items */
            min-width: 90px; /* Ensure minimum space */
            flex-shrink: 0; /* Prevent shrinking */
          }
          .topbar-center {
            flex: 1; /* Take remaining horizontal space */
            display: flex;
            align-items: center;
            justify-content: center; /* Center content horizontally */
            padding: 0 24px; /* Horizontal padding */
            overflow: visible; /* Allow dropdown to overflow */
            min-width: 0; /* Allow shrinking */
          }
          .topbar-content-wrapper {
            display: flex;
            align-items: center;
            justify-content: center; /* Center items within the wrapper */
            gap: ${styles.spacing}; /* Space between items */
            max-width: 800px; /* Limit maximum width */
            width: 100%;
          }
          .topbar-right {
            display: flex;
            align-items: center;
            gap: ${styles.spacing}; /* Space between items */
            min-width: 90px; /* Ensure minimum space */
            justify-content: flex-end; /* Align items to the right */
            flex-shrink: 0; /* Prevent shrinking */
          }

          /* --- Info Dropdown Trigger Button --- */
          .info-dropdown-trigger.icon-button {
            background: none;
            border: none;
            padding: 6px; /* Padding around the icon */
            margin: 0;
            cursor: pointer;
            color: ${theme.text2}; /* Use secondary text color */
            display: inline-flex; /* Align icon properly */
            align-items: center;
            justify-content: center;
            border-radius: 6px; /* Rounded corners */
            transition: background-color 0.2s ease, color 0.2s ease; /* Smooth transitions */
            line-height: 1; /* Prevent extra vertical space */
          }
          /* Hover and open states for the trigger */
          .info-dropdown-trigger.icon-button:hover,
          .info-dropdown-trigger.icon-button[aria-expanded="true"] {
            background-color: ${theme.surface2}; /* Subtle background on hover/open */
            color: ${theme.text}; /* Use primary text color */
          }

          /* --- Info Dropdown Positioning Wrapper --- */
          .info-dropdown-wrapper {
            position: relative; /* Needed for absolute positioning of the menu */
            display: inline-flex; /* Keep wrapper size tight to the button */
          }

          /* --- Dropdown Menu Container --- */
          .dropdown-menu {
            position: absolute; /* Position relative to the wrapper */
            top: calc(100% + 6px); /* Position below the trigger with a gap */
            left: 50%; /* Start positioning from the center */
            transform: translateX(-50%); /* Shift left by half its width to center it */
            min-width: 420px; /* Adjusted min-width for horizontal layout */
            max-width: 500px; /* Maximum width */
            border-radius: 8px; /* Rounded corners for the menu */
            background: ${theme.surface1}; /* Background color */
            border: 1px solid ${theme.border}; /* Border */
            color: ${theme.text}; /* Default text color inside */
            font-size: 14px; /* Base font size */
            z-index: 10; /* Ensure it's above other elements */
            box-shadow: 0 4px 12px rgba(0,0,0,0.15); /* Drop shadow effect */
            display: flex; /* Use flexbox for layout */
            /* Default to row layout for wider screens */
            flex-direction: row;
            gap: 12px; /* Gap between sections and divider in row mode */
            padding: 12px; /* Overall padding for the menu */
            box-sizing: border-box;
          }

          /* --- Dropdown Sections (Participants, Tokens) --- */
          .dropdown-section {
            /* No padding here, handled by .dropdown-menu or specific items */
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
          }
          .dropdown-section-header {
             font-size: 12px; /* Smaller font size for headers */
             font-weight: 600; /* Bold */
             color: ${theme.textSecondary}; /* Secondary color */
             margin: 0 0 8px 0; /* Space below header */
             padding: 0;
             text-transform: uppercase; /* Uppercase text */
             letter-spacing: 0.5px; /* Slight letter spacing */
          }

          /* Specific section styling */
          .participants-section {
            flex: 1; /* Take up available space in row layout */
            min-width: 200px; /* Ensure minimum width */
          }
          .token-section {
            flex-shrink: 0; /* Prevent shrinking */
            min-width: 120px; /* Minimum width for the token section */
            justify-content: flex-start; /* Align header/items to top */
            padding-top: 0; /* Align with participant header */
          }

          /* --- Cybot List within Dropdown --- */
          .cybot-list-dropdown {
            display: flex; /* Use flex */
            flex-direction: column; /* Stack chips vertically */
            gap: 6px; /* Space between chips */
            max-height: 150px; /* Limit height */
            overflow-y: auto; /* Enable vertical scrolling if needed */
            padding-right: 4px; /* Add space for scrollbar */
            margin-bottom: 10px; /* Space below the list, before Add button */
            /* Scrollbar styling (optional) */
            scrollbar-width: thin; /* For Firefox */
            scrollbar-color: ${theme.border} transparent; /* For Firefox */
          }
          /* Webkit scrollbar styling */
          .cybot-list-dropdown::-webkit-scrollbar { width: 6px; }
          .cybot-list-dropdown::-webkit-scrollbar-track { background: transparent; }
          .cybot-list-dropdown::-webkit-scrollbar-thumb { background-color: ${theme.border}; border-radius: 3px; }
          .cybot-list-dropdown::-webkit-scrollbar-thumb:hover { background-color: ${theme.borderHover}; }

          /* Text shown when list is empty */
          .no-participants-text-dropdown {
             font-style: italic;
             color: ${theme.textSecondary};
             font-size: 13px;
             text-align: center;
             padding: 10px 0;
          }

          /* Optional styling for chips specifically within the dropdown */
          .dropdown-list-item {
            /* Example: override default chip margin if needed */
            /* margin-bottom: 0; */
          }

          /* --- General Dropdown Item Styling --- */
          .dropdown-item {
            display: flex;
            align-items: center; /* Vertically align content */
            gap: 8px; /* Space between icon and text if applicable */
            padding: 6px 0; /* Vertical padding */
            white-space: nowrap; /* Prevent text wrapping */
            text-align: left; /* Align text to the left */
            background: none; /* No background by default */
            border: none; /* No border by default */
            width: 100%; /* Take full width of its container section */
            color: inherit; /* Inherit text color */
            font-size: inherit; /* Inherit font size */
            cursor: default; /* Default cursor (non-interactive) */
            box-sizing: border-box;
          }

          /* --- Add Participant Button in Dropdown --- */
          .add-participant-button-dropdown {
             /* Inherits .dropdown-item styles */
             cursor: pointer; /* Make it interactive */
             color: ${theme.text}; /* Primary text color */
             padding: 8px 0; /* Adjust padding */
             border-radius: 4px; /* Slight rounding */
             transition: background-color 0.15s ease; /* Hover transition */
             margin-top: 4px; /* Optional space above */
          }
          /* Hover state for the add button */
          .add-participant-button-dropdown:hover {
              background-color: ${theme.surface2}; /* Subtle background on hover */
          }
          /* Icon color within the add button */
          .add-participant-button-dropdown svg {
             color: ${theme.textSecondary}; /* Use secondary color for icon */
             flex-shrink: 0; /* Prevent icon shrinking */
          }
          .add-participant-button-dropdown span {
             flex-grow: 1; /* Allow text to fill space */
          }

          /* --- Token Info Item in Dropdown --- */
          .token-info-dropdown {
             /* Inherits .dropdown-item styles */
             color: ${theme.textSecondary}; /* Use secondary text color */
             font-size: 13px; /* Slightly smaller font */
             justify-content: space-between; /* Space between label and value */
             padding: 8px 0; /* Adjust padding */
          }
          /* Align value to the right if needed */
          .token-info-dropdown span:last-child {
             font-weight: 500;
             color: ${theme.text};
             /* text-align: right; */ /* Optional: align number right */
          }

          /* --- Dropdown Divider Line --- */
          .dropdown-divider {
            /* Default: Vertical divider for row layout */
            width: 1px; /* Thickness */
            background-color: ${theme.border}; /* Use border color */
            align-self: stretch; /* Stretch to fill flex container height */
            margin: 0; /* Reset margin */
            flex-shrink: 0; /* Prevent shrinking */
          }

          /* --- Responsive Design --- */
          /* Adjustments for general responsiveness */
          @media (max-width: 768px) {
            .topbar { padding: 8px 12px; } /* Reduce padding */
            .topbar-center { padding: 0 8px; gap: 4px; } /* Reduce padding/gap */
            .topbar-right { gap: 4px; } /* Reduce gap */

            /* --- Dropdown adjustments for smaller screens --- */
            .dropdown-menu {
              flex-direction: column; /* Stack sections vertically */
              min-width: 240px; /* Reset min-width for vertical layout */
              max-width: 300px; /* Adjust max-width if needed */
              gap: 8px; /* Adjust gap for vertical stacking */
              padding: 8px 12px; /* Adjust overall padding */
            }
            .participants-section, .token-section {
               min-width: unset; /* Remove min-width constraints */
               width: 100%; /* Ensure sections take full width */
            }
            .token-section {
                padding-top: 0; /* Reset padding */
                align-items: stretch; /* Reset alignment */
            }
            .dropdown-divider {
              /* Change to horizontal divider for column layout */
              width: auto; /* Full width */
              height: 1px; /* Thickness */
              align-self: auto; /* Reset alignment */
              margin: 4px 0; /* Vertical margin */
            }
             .token-info-dropdown {
               justify-content: flex-start; /* Align left in vertical layout */
             }
             .token-info-dropdown span:last-child {
                 margin-left: 4px; /* Add space between label and value */
             }
          }
          /* Further adjustments for very small screens */
          @media (max-width: 640px) {
             /* Hide less important elements on very small screens */
             .topbar-center .editable-title {
               max-width: 100px; /* Limit title width */
               overflow: hidden;
               text-overflow: ellipsis;
               white-space: nowrap;
             }
             .topbar-center .create-dialog-button,
             .topbar-center .delete-dialog-button {
               display: none; /* Hide create/delete buttons */
             }
             /* Dropdown position might need adjustment on very small screens */
             /* .dropdown-menu { left: auto; right: 0; transform: none; } */
          }
        `}
      </style>
    </>
  );
};

// Export the component for use in other parts of the application
export default TopBar;
