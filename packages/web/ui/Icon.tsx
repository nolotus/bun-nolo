import React from "react";
import clsx from "clsx";
import { CloseIcon } from "./icons/CloseIcon";
import { PlusIcon } from "./icons/PlusIcon";
import { ChevronDownIcon } from "./icons/ChevronDownIcon";
import { ChevronUpIcon } from "./icons/ChevronUpIcon";
import { UserIcon } from "./icons/UserIcon";
import { SpinnerIcon } from "./icons/SpinnerIcon";
import { SettingIcon } from "./icons/SettingIcon";
import { NaviIcon } from "./icons/NaviIcon";
import { ArchiveIcon } from "./icons/ArchiveIcon";
import { TagIcon } from "./icons/TagIcon";
import { BellIcon } from "./icons/BellIcon";
import { CalendarIcon } from "./icons/CalendarIcon";
import { ChatIcon } from "./icons/ChatIcon";
import { SweepIcon } from "./icons/SweepIcon";
import { TrashIcon } from "./icons/TrashIcon";

interface IconProps {
  name: keyof typeof iconMap;
  className?: string;
  onClick?: () => void;
}

export const iconMap = {
  plus: PlusIcon,
  close: CloseIcon,
  chevronDown: ChevronDownIcon,
  chevronUp: ChevronUpIcon,
  user: UserIcon,
  spinner: SpinnerIcon,
  setting: SettingIcon,
  navi: NaviIcon,
  archive: ArchiveIcon,
  tag: TagIcon,
  bell: BellIcon,
  calendar: CalendarIcon,
  chat: ChatIcon,
  sweep: SweepIcon,
  trash: TrashIcon,
};

export const Icon: React.FC<IconProps> = ({
  name,
  className = "",
  onClick,
}) => {
  const IconComponent = iconMap[name];
  return (
    <IconComponent
      alt={name}
      className={clsx("h-6 w-6", className)}
      onClick={onClick}
    />
  );
};
