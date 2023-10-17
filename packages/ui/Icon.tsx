import React from "react";
import clsx from "clsx";
import { CloseIcon } from "ui/icons/CloseIcon";
import { PlusIcon } from "ui/icons/PlusIcon";
import { ChevronDownIcon } from "ui/icons/ChevronDownIcon";
import { ChevronUpIcon } from "ui/icons/ChevronUpIcon";
import { UserIcon } from "ui/icons/UserIcon";
import { SpinnerIcon } from "ui/icons/SpinnerIcon";
import { SettingIcon } from "ui/icons/SettingIcon";
import { NaviIcon } from "ui/icons/NaviIcon";
import { ArchiveIcon } from "ui/icons/ArchiveIcon";
import { TagIcon } from "ui/icons/TagIcon";
import { BellIcon } from "ui/icons/BellIcon";
import { CalendarIcon } from "ui/icons/CalendarIcon";
import { ChatIcon } from "ui/icons/ChatIcon";
import { SweepIcon } from "ui/icons/SweepIcon";
import { TrashIcon } from "ui/icons/TrashIcon";

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
