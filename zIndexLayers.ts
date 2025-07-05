/**
 * Z-Index层级管理
 * 统一管理所有组件的层级，避免冲突
 */

export const Z_INDEX = {
  // 基础层级 (0-99)
  BASE: 0,

  // 内容层级 (100-499)
  CONTENT: 100,
  SIDEBAR_CONTENT: 200,

  // 导航层级 (500-799)
  SIDEBAR_MOBILE: 860, // Must be higher than SIDEBAR_OVERLAY
  SIDEBAR_DESKTOP: 600,

  // 遮罩层级 (800-899)
  OVERLAY_BASE: 800,
  SIDEBAR_OVERLAY: 850,

  // 下拉菜单层级 (900-999)
  DROPDOWN_OVERLAY: 900,
  DROPDOWN_CONTENT: 950,

  // 顶部导航层级 (1000-1099)
  TOPBAR: 1100,
  TOPBAR_DROPDOWN: 1050,

  // 模态框层级 (1100-1199)
  MODAL_OVERLAY: 1100,
  MODAL_CONTENT: 1150,

  // 最高层级 (1200+)
  TOAST: 1200,
  TOOLTIP: 1250,
} as const;

export type ZIndexKey = keyof typeof Z_INDEX;
