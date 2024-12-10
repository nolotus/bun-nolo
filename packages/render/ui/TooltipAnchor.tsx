import React from "react";
import * as Ariakit from "@ariakit/react";
import { AnimatePresence, motion } from "framer-motion";
import { forwardRef } from "react";

interface TooltipAnchorProps extends Ariakit.TooltipAnchorProps {
  description: string;
}

export const TooltipAnchor = forwardRef<HTMLDivElement, TooltipAnchorProps>(
  function TooltipAnchor({ description, ...props }, ref) {
    const tooltip = Ariakit.useTooltipStore();
    const mounted = Ariakit.useStoreState(tooltip, "mounted");

    // We move the tooltip up or down depending on the current placement.
    const y = Ariakit.useStoreState(tooltip, (state) => {
      const dir = state.currentPlacement.split("-")[0]!;
      return dir === "top" ? -8 : 8;
    });

    return (
      <>
        <style>
          {`
            .tooltip {
              z-index: 50;
              cursor: default;
              border-radius: 0.375rem;
              border-width: 1px;
              border-color: hsl(204 20% 82%);
              background-color: hsl(204 20% 94%);
              padding: 0.25rem 0.5rem;
              font-size: 0.875rem;
              line-height: 1.25rem;
              color: black;
              box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            }


            .tooltip:where(.dark, .dark *) {
              border-color: hsl(204 4% 24%);
              background-color: hsl(204 4% 16%);
              color: white;
              box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.15);
            }


            .link {
              font-weight: 500;
              color: hsl(204 100% 35%);
              text-decoration-line: underline;
              text-decoration-thickness: 1px;
              text-underline-offset: 0.25em;
            }


            .link:hover {
              text-decoration-thickness: 3px;
            }


            .link:where(.dark, .dark *) {
              color: hsl(204 100% 64%);
            }
          `}
        </style>
        <Ariakit.TooltipProvider store={tooltip} hideTimeout={250}>
          <Ariakit.TooltipAnchor {...props} ref={ref} />
          <AnimatePresence>
            {mounted && (
              <Ariakit.Tooltip
                gutter={4}
                alwaysVisible
                className="tooltip"
                render={
                  <motion.div
                    initial={{ opacity: 0, y }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y }}
                  />
                }
              >
                <Ariakit.TooltipArrow />
                {description}
              </Ariakit.Tooltip>
            )}
          </AnimatePresence>
        </Ariakit.TooltipProvider>
      </>
    );
  }
);
