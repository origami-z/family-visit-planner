import { jsx, jsxs } from "react/jsx-runtime";
import * as React from "react";
import { useState, useEffect, createContext, useContext, useMemo } from "react";
import { IconX, IconHome, IconUsers, IconCalendar, IconSettings, IconPlane, IconAlertTriangle, IconCalendarOff, IconPlus, IconDotsVertical, IconPencil, IconTrash, IconSelector, IconCheck, IconChevronUp, IconChevronDown, IconChevronLeft, IconChevronRight, IconDownload, IconShare, IconUpload } from "@tabler/icons-react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Button as Button$1 } from "@base-ui/react/button";
import { Dialog as Dialog$1 } from "@base-ui/react/dialog";
import { Tooltip as Tooltip$1 } from "@base-ui/react/tooltip";
import { parseISO, isWithinInterval, isAfter, subYears, addYears, isBefore, differenceInDays, format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, addMonths, subMonths } from "date-fns";
import { Input as Input$1 } from "@base-ui/react/input";
import { Menu } from "@base-ui/react/menu";
import { Select as Select$1 } from "@base-ui/react/select";
import { Tabs as Tabs$1 } from "@base-ui/react/tabs";
const FamilyPlannerContext = createContext(
  null
);
const STORAGE_KEY = "family-planner-data";
const defaultState = {
  members: [],
  trips: [],
  globalSettings: {
    warnings: {
      enabled: true,
      rules: []
    },
    yearLimit: 180
  }
};
function storeState(state) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
function migrateData(oldData) {
  let migratedData = false;
  if (oldData.trips) {
    oldData.trips = oldData.trips.map((trip) => {
      if (trip.memberId && !trip.memberIds) {
        migratedData = true;
        delete trip.memberId;
        return {
          ...trip,
          memberIds: [trip.memberId]
        };
      } else {
        return trip;
      }
    });
  }
  if (migratedData) {
    storeState(oldData);
  }
  return oldData;
}
function FamilyPlannerProvider({ children }) {
  const [state, setState] = useState(() => {
    if (typeof window === "undefined") return defaultState;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return migrateData(JSON.parse(stored));
      } catch {
        return defaultState;
      }
    }
    return defaultState;
  });
  useEffect(() => {
    storeState(state);
  }, [state]);
  const addMember = (member) => {
    const newMember = {
      ...member,
      id: crypto.randomUUID()
    };
    setState((prev) => ({
      ...prev,
      members: [...prev.members, newMember]
    }));
  };
  const updateMember = (id, updates) => {
    setState((prev) => ({
      ...prev,
      members: prev.members.map(
        (m) => m.id === id ? { ...m, ...updates } : m
      )
    }));
  };
  const deleteMember = (id) => {
    setState((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.id !== id),
      trips: prev.trips.map((t) => ({
        ...t,
        memberIds: t.memberIds.filter((mid) => mid !== id)
      })).filter((t) => t.memberIds.length > 0)
    }));
  };
  const addTrip = (trip) => {
    const newTrip = {
      ...trip,
      id: crypto.randomUUID()
    };
    setState((prev) => ({
      ...prev,
      trips: [...prev.trips, newTrip]
    }));
  };
  const updateTrip = (id, updates) => {
    setState((prev) => ({
      ...prev,
      trips: prev.trips.map((t) => t.id === id ? { ...t, ...updates } : t)
    }));
  };
  const deleteTrip = (id) => {
    setState((prev) => ({
      ...prev,
      trips: prev.trips.filter((t) => t.id !== id)
    }));
  };
  const updateGlobalSettings = (settings) => {
    setState((prev) => ({
      ...prev,
      globalSettings: {
        ...prev.globalSettings,
        ...settings
      }
    }));
  };
  const importData = (data) => {
    setState(data);
  };
  const exportData = () => state;
  return /* @__PURE__ */ jsx(
    FamilyPlannerContext.Provider,
    {
      value: {
        state,
        addMember,
        updateMember,
        deleteMember,
        addTrip,
        updateTrip,
        deleteTrip,
        updateGlobalSettings,
        importData,
        exportData
      },
      children
    }
  );
}
function useFamilyPlanner() {
  const context = useContext(FamilyPlannerContext);
  if (!context) {
    throw new Error(
      "useFamilyPlanner must be used within FamilyPlannerProvider"
    );
  }
  return context;
}
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const buttonVariants = cva(
  "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 rounded-lg border border-transparent bg-clip-padding text-sm font-medium focus-visible:ring-[3px] aria-invalid:ring-[3px] [&_svg:not([class*='size-'])]:size-4 inline-flex items-center justify-center whitespace-nowrap transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 [&_svg]:shrink-0 outline-none group/button select-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        outline: "border-border bg-background hover:bg-muted hover:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 aria-expanded:bg-muted aria-expanded:text-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost: "hover:bg-muted hover:text-foreground dark:hover:bg-muted/50 aria-expanded:bg-muted aria-expanded:text-foreground",
        destructive: "bg-destructive/10 hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/20 text-destructive focus-visible:border-destructive/40 dark:hover:bg-destructive/30",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-8",
        "icon-xs": "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Button$1,
    {
      "data-slot": "button",
      className: cn(buttonVariants({ variant, size, className })),
      ...props
    }
  );
}
function Input({ className, type, ...props }) {
  return /* @__PURE__ */ jsx(
    Input$1,
    {
      type,
      "data-slot": "input",
      className: cn(
        "dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 disabled:bg-input/50 dark:disabled:bg-input/80 h-8 rounded-lg border bg-transparent px-2.5 py-1 text-base transition-colors file:h-6 file:text-sm file:font-medium focus-visible:ring-[3px] aria-invalid:ring-[3px] md:text-sm file:text-foreground placeholder:text-muted-foreground w-full min-w-0 outline-none file:inline-flex file:border-0 file:bg-transparent disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ...props
    }
  );
}
function Sheet({ ...props }) {
  return /* @__PURE__ */ jsx(Dialog$1.Root, { "data-slot": "sheet", ...props });
}
function SheetPortal({ ...props }) {
  return /* @__PURE__ */ jsx(Dialog$1.Portal, { "data-slot": "sheet-portal", ...props });
}
function SheetOverlay({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    Dialog$1.Backdrop,
    {
      "data-slot": "sheet-overlay",
      className: cn(
        "data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 bg-black/10 duration-100 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs fixed inset-0 z-50",
        className
      ),
      ...props
    }
  );
}
function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}) {
  return /* @__PURE__ */ jsxs(SheetPortal, { children: [
    /* @__PURE__ */ jsx(SheetOverlay, {}),
    /* @__PURE__ */ jsxs(
      Dialog$1.Popup,
      {
        "data-slot": "sheet-content",
        "data-side": side,
        className: cn(
          "bg-background data-open:animate-in data-closed:animate-out data-[side=right]:data-closed:slide-out-to-right-10 data-[side=right]:data-open:slide-in-from-right-10 data-[side=left]:data-closed:slide-out-to-left-10 data-[side=left]:data-open:slide-in-from-left-10 data-[side=top]:data-closed:slide-out-to-top-10 data-[side=top]:data-open:slide-in-from-top-10 data-closed:fade-out-0 data-open:fade-in-0 data-[side=bottom]:data-closed:slide-out-to-bottom-10 data-[side=bottom]:data-open:slide-in-from-bottom-10 fixed z-50 flex flex-col gap-4 bg-clip-padding text-sm shadow-lg transition duration-200 ease-in-out data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:border-t data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:border-b data-[side=left]:sm:max-w-sm data-[side=right]:sm:max-w-sm",
          className
        ),
        ...props,
        children: [
          children,
          showCloseButton && /* @__PURE__ */ jsxs(
            Dialog$1.Close,
            {
              "data-slot": "sheet-close",
              render: /* @__PURE__ */ jsx(
                Button,
                {
                  variant: "ghost",
                  className: "absolute top-3 right-3",
                  size: "icon-sm"
                }
              ),
              children: [
                /* @__PURE__ */ jsx(IconX, {}),
                /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
              ]
            }
          )
        ]
      }
    )
  ] });
}
function SheetHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "sheet-header",
      className: cn("gap-0.5 p-4 flex flex-col", className),
      ...props
    }
  );
}
function SheetTitle({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    Dialog$1.Title,
    {
      "data-slot": "sheet-title",
      className: cn("text-foreground text-base font-medium", className),
      ...props
    }
  );
}
function SheetDescription({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Dialog$1.Description,
    {
      "data-slot": "sheet-description",
      className: cn("text-muted-foreground text-sm", className),
      ...props
    }
  );
}
function TooltipProvider({
  delay = 0,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Tooltip$1.Provider,
    {
      "data-slot": "tooltip-provider",
      delay,
      ...props
    }
  );
}
function Tooltip({ ...props }) {
  return /* @__PURE__ */ jsx(TooltipProvider, { children: /* @__PURE__ */ jsx(Tooltip$1.Root, { "data-slot": "tooltip", ...props }) });
}
function TooltipTrigger({ ...props }) {
  return /* @__PURE__ */ jsx(Tooltip$1.Trigger, { "data-slot": "tooltip-trigger", ...props });
}
function TooltipContent({
  className,
  side = "top",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  children,
  ...props
}) {
  return /* @__PURE__ */ jsx(Tooltip$1.Portal, { children: /* @__PURE__ */ jsx(
    Tooltip$1.Positioner,
    {
      align,
      alignOffset,
      side,
      sideOffset,
      className: "isolate z-50",
      children: /* @__PURE__ */ jsxs(
        Tooltip$1.Popup,
        {
          "data-slot": "tooltip-content",
          className: cn(
            "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 rounded-md px-3 py-1.5 text-xs bg-foreground text-background z-50 w-fit max-w-xs origin-(--transform-origin)",
            className
          ),
          ...props,
          children: [
            children,
            /* @__PURE__ */ jsx(Tooltip$1.Arrow, { className: "size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px] bg-foreground fill-foreground z-50 data-[side=bottom]:top-1 data-[side=left]:top-1/2! data-[side=left]:-right-1 data-[side=left]:-translate-y-1/2 data-[side=right]:top-1/2! data-[side=right]:-left-1 data-[side=right]:-translate-y-1/2 data-[side=top]:-bottom-2.5" })
          ]
        }
      )
    }
  ) });
}
const MOBILE_BREAKPOINT = 768;
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(void 0);
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return !!isMobile;
}
const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";
const SidebarContext = React.createContext(null);
function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}
function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = React.useCallback(
    (value) => {
      const openState = typeof value === "function" ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [setOpenProp, open]
  );
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open2) => !open2) : setOpen((open2) => !open2);
  }, [isMobile, setOpen, setOpenMobile]);
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);
  const state = open ? "expanded" : "collapsed";
  const contextValue = React.useMemo(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
  );
  return /* @__PURE__ */ jsx(SidebarContext.Provider, { value: contextValue, children: /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "sidebar-wrapper",
      style: {
        "--sidebar-width": SIDEBAR_WIDTH,
        "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
        ...style
      },
      className: cn(
        "group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full",
        className
      ),
      ...props,
      children
    }
  ) });
}
function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offExamples",
  className,
  children,
  ...props
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();
  if (collapsible === "none") {
    return /* @__PURE__ */ jsx(
      "div",
      {
        "data-slot": "sidebar",
        className: cn(
          "bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col",
          className
        ),
        ...props,
        children
      }
    );
  }
  if (isMobile) {
    return /* @__PURE__ */ jsx(Sheet, { open: openMobile, onOpenChange: setOpenMobile, ...props, children: /* @__PURE__ */ jsxs(
      SheetContent,
      {
        "data-sidebar": "sidebar",
        "data-slot": "sidebar",
        "data-mobile": "true",
        className: "bg-sidebar text-sidebar-foreground w-(--sidebar-width) p-0 [&>button]:hidden",
        style: {
          "--sidebar-width": SIDEBAR_WIDTH_MOBILE
        },
        side,
        children: [
          /* @__PURE__ */ jsxs(SheetHeader, { className: "sr-only", children: [
            /* @__PURE__ */ jsx(SheetTitle, { children: "Sidebar" }),
            /* @__PURE__ */ jsx(SheetDescription, { children: "Displays the mobile sidebar." })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex h-full w-full flex-col", children })
        ]
      }
    ) });
  }
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "group peer text-sidebar-foreground hidden md:block",
      "data-state": state,
      "data-collapsible": state === "collapsed" ? collapsible : "",
      "data-variant": variant,
      "data-side": side,
      "data-slot": "sidebar",
      children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            "data-slot": "sidebar-gap",
            className: cn(
              "transition-[width] duration-200 ease-linear relative w-(--sidebar-width) bg-transparent",
              "group-data-[collapsible=offExamples]:w-0",
              "group-data-[side=right]:rotate-180",
              variant === "floating" || variant === "inset" ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)"
            )
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            "data-slot": "sidebar-container",
            className: cn(
              "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex",
              side === "left" ? "left-0 group-data-[collapsible=offExamples]:left-[calc(var(--sidebar-width)*-1)]" : "right-0 group-data-[collapsible=offExamples]:right-[calc(var(--sidebar-width)*-1)]",
              // Adjust the padding for floating and inset variants.
              variant === "floating" || variant === "inset" ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
              className
            ),
            ...props,
            children: /* @__PURE__ */ jsx(
              "div",
              {
                "data-sidebar": "sidebar",
                "data-slot": "sidebar-inner",
                className: "bg-sidebar group-data-[variant=floating]:ring-sidebar-border group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:shadow-sm group-data-[variant=floating]:ring-1 flex size-full flex-col",
                children
              }
            )
          }
        )
      ]
    }
  );
}
function SidebarHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "sidebar-header",
      "data-sidebar": "header",
      className: cn("gap-2 p-2 flex flex-col", className),
      ...props
    }
  );
}
function SidebarContent({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "sidebar-content",
      "data-sidebar": "content",
      className: cn(
        "no-scrollbar gap-0 flex min-h-0 flex-1 flex-col overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className
      ),
      ...props
    }
  );
}
function SidebarMenu({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "ul",
    {
      "data-slot": "sidebar-menu",
      "data-sidebar": "menu",
      className: cn("gap-0 flex w-full min-w-0 flex-col", className),
      ...props
    }
  );
}
function SidebarMenuItem({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "li",
    {
      "data-slot": "sidebar-menu-item",
      "data-sidebar": "menu-item",
      className: cn("group/menu-item relative", className),
      ...props
    }
  );
}
const sidebarMenuButtonVariants = cva(
  "ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground data-open:hover:bg-sidebar-accent data-open:hover:text-sidebar-accent-foreground gap-2 rounded-md p-2 text-left text-sm transition-[width,height,padding] group-has-data-[sidebar=menu-action]/menu-item:pr-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! focus-visible:ring-2 data-active:font-medium peer/menu-button flex w-full items-center overflow-hidden outline-hidden group/menu-button disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline: "bg-background hover:bg-sidebar-accent hover:text-sidebar-accent-foreground shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]"
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
function SidebarMenuButton({
  render,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  ...props
}) {
  const { isMobile, state } = useSidebar();
  const comp = useRender({
    defaultTagName: "button",
    props: mergeProps(
      {
        className: cn(sidebarMenuButtonVariants({ variant, size }), className)
      },
      props
    ),
    render: !tooltip ? render : TooltipTrigger,
    state: {
      slot: "sidebar-menu-button",
      sidebar: "menu-button",
      size,
      active: isActive
    }
  });
  if (!tooltip) {
    return comp;
  }
  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip
    };
  }
  return /* @__PURE__ */ jsxs(Tooltip, { children: [
    comp,
    /* @__PURE__ */ jsx(
      TooltipContent,
      {
        side: "right",
        align: "center",
        hidden: state !== "collapsed" || isMobile,
        ...tooltip
      }
    )
  ] });
}
function DashboardLayout({
  children,
  activeSection,
  onSectionChange
}) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: IconHome },
    { id: "members", label: "Members", icon: IconUsers },
    { id: "calendar", label: "Calendar", icon: IconCalendar },
    { id: "settings", label: "Settings", icon: IconSettings }
  ];
  return /* @__PURE__ */ jsx(SidebarProvider, { children: /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen w-full", children: [
    /* @__PURE__ */ jsxs(Sidebar, { children: [
      /* @__PURE__ */ jsx(SidebarHeader, { className: "border-b border-border px-6 py-4", children: /* @__PURE__ */ jsx("h1", { className: "text-xl font-bold text-foreground", children: "Family Visit Planner" }) }),
      /* @__PURE__ */ jsx(SidebarContent, { children: /* @__PURE__ */ jsx(SidebarMenu, { children: menuItems.map((item) => {
        const Icon = item.icon;
        return /* @__PURE__ */ jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsxs(
          SidebarMenuButton,
          {
            isActive: activeSection === item.id,
            onClick: () => onSectionChange(item.id),
            children: [
              /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsx("span", { children: item.label })
            ]
          }
        ) }, item.id);
      }) }) })
    ] }),
    /* @__PURE__ */ jsx("main", { className: "flex-1 overflow-auto bg-background", children })
  ] }) });
}
function useEmptyDates(trips, members) {
  return useMemo(() => {
    if (trips.length === 0 || members.length === 0) return [];
    const allDates = trips.flatMap((trip) => [
      parseISO(trip.entryDate),
      parseISO(trip.departureDate)
    ]).sort((a, b) => a.getTime() - b.getTime());
    if (allDates.length === 0) return [];
    const emptyPeriods = [];
    const minDate = allDates[0];
    const maxDate = allDates[allDates.length - 1];
    let currentDate = minDate;
    while (isBefore(currentDate, maxDate) || currentDate.getTime() === maxDate.getTime()) {
      const hasFamily = trips.some((trip) => {
        const start = parseISO(trip.entryDate);
        const end = parseISO(trip.departureDate);
        return isWithinInterval(currentDate, { start, end });
      });
      if (!hasFamily) {
        const periodStart = currentDate;
        let periodEnd = currentDate;
        currentDate = addDays(currentDate, 1);
        while (isBefore(currentDate, maxDate) || currentDate.getTime() === maxDate.getTime()) {
          const stillEmpty = !trips.some((trip) => {
            const start = parseISO(trip.entryDate);
            const end = parseISO(trip.departureDate);
            return isWithinInterval(currentDate, { start, end });
          });
          if (stillEmpty) {
            periodEnd = currentDate;
            currentDate = addDays(currentDate, 1);
          } else {
            break;
          }
        }
        emptyPeriods.push({
          startDate: format(periodStart, "yyyy-MM-dd"),
          endDate: format(periodEnd, "yyyy-MM-dd"),
          duration: differenceInDays(periodEnd, periodStart) + 1
        });
      } else {
        currentDate = addDays(currentDate, 1);
      }
    }
    return emptyPeriods;
  }, [trips, members]);
}
function isWithinOneYar(start, end, refDay) {
  return isAfter(end, subYears(refDay, 1)) || isBefore(start, addYears(refDay, 1));
}
function useMemberStats(members, trips, yearLimit) {
  return useMemo(() => {
    const today = /* @__PURE__ */ new Date();
    return members.map((member) => {
      const memberTripsSorted = trips.filter((t) => t.memberIds.includes(member.id)).sort(
        (a, b) => parseISO(a.entryDate).getTime() - parseISO(b.entryDate).getTime()
      );
      const currentTrip = memberTripsSorted.find((trip) => {
        const start = parseISO(trip.entryDate);
        const end = parseISO(trip.departureDate);
        return isWithinInterval(today, { start, end });
      });
      const futureTrips = memberTripsSorted.filter(
        (trip) => isAfter(parseISO(trip.entryDate), today)
      );
      subYears(today, 1);
      const highlightTrips = [];
      for (let i = 0; i < memberTripsSorted.length; i++) {
        const trip = memberTripsSorted[i];
        const start = parseISO(trip.entryDate);
        const end = parseISO(trip.departureDate);
        if (!isWithinOneYar(start, end, today)) {
          continue;
        }
        let daysInYear = 0;
        const refDate = addYears(start, 1);
        for (let testIndex = i; testIndex < memberTripsSorted.length; testIndex++) {
          const testTrip = memberTripsSorted[testIndex];
          const testTripStart = parseISO(testTrip.entryDate);
          const testTripEnd = parseISO(testTrip.departureDate);
          if (isAfter(testTripStart, refDate)) {
            break;
          }
          const overlapStart = isBefore(testTripStart, refDate) ? testTripStart : refDate;
          const overlapEnd = isAfter(testTripEnd, refDate) ? refDate : testTripEnd;
          if (isBefore(overlapStart, overlapEnd) || overlapStart.getTime() === overlapEnd.getTime()) {
            daysInYear += differenceInDays(overlapEnd, overlapStart) + 1;
          }
        }
        highlightTrips.push({
          trip,
          refDate: format(refDate, "yyyy-MM-dd"),
          daysInYear,
          isOverLimit: daysInYear > yearLimit
        });
      }
      const activeWarnings = [];
      return {
        memberId: member.id,
        name: member.name,
        color: member.color,
        currentStatus: currentTrip ? "present" : "away",
        nextTrip: futureTrips[0],
        activeWarnings,
        highlightTrips
      };
    });
  }, [members, trips, yearLimit]);
}
function Card({
  className,
  size = "default",
  ...props
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card",
      "data-size": size,
      className: cn(
        "ring-foreground/10 bg-card text-card-foreground gap-4 overflow-hidden rounded-xl py-4 text-sm ring-1 has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 data-[size=sm]:has-data-[slot=card-footer]:pb-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl group/card flex flex-col",
        className
      ),
      ...props
    }
  );
}
function CardHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-header",
      className: cn(
        "gap-1 rounded-t-xl px-4 group-data-[size=sm]/card:px-3 [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3 group/card-header @container/card-header grid auto-rows-min items-start has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto]",
        className
      ),
      ...props
    }
  );
}
function CardTitle({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-title",
      className: cn(
        "text-base leading-snug font-medium group-data-[size=sm]/card:text-sm",
        className
      ),
      ...props
    }
  );
}
function CardDescription({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-description",
      className: cn("text-muted-foreground text-sm", className),
      ...props
    }
  );
}
function CardContent({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "card-content",
      className: cn("px-4 group-data-[size=sm]/card:px-3", className),
      ...props
    }
  );
}
const badgeVariants = cva(
  "h-5 gap-1 rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium transition-all has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:size-3! inline-flex items-center justify-center w-fit whitespace-nowrap shrink-0 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-colors overflow-hidden group/badge",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary: "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive: "bg-destructive/10 [a]:hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 text-destructive dark:bg-destructive/20",
        outline: "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground",
        ghost: "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({
  className,
  variant = "default",
  render,
  ...props
}) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps(
      {
        className: cn(badgeVariants({ className, variant }))
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant
    }
  });
}
const alertVariants = cva(
  "grid gap-0.5 rounded-lg border px-2.5 py-2 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4 w-full relative group/alert",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive: "text-destructive bg-card *:data-[slot=alert-description]:text-destructive/90 *:[svg]:text-current"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Alert({
  className,
  variant,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "alert",
      role: "alert",
      className: cn(alertVariants({ variant }), className),
      ...props
    }
  );
}
function AlertDescription({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "alert-description",
      className: cn(
        "text-muted-foreground text-sm text-balance md:text-pretty [&_p:not(:last-child)]:mb-4 [&_a]:hover:text-foreground [&_a]:underline [&_a]:underline-offset-3",
        className
      ),
      ...props
    }
  );
}
function DashboardView() {
  const { state } = useFamilyPlanner();
  const stats = useMemberStats(
    state.members,
    state.trips,
    state.globalSettings.yearLimit
  );
  const emptyPeriods = useEmptyDates(state.trips, state.members);
  const activeTrips = stats.filter((s) => s.currentStatus === "present").length;
  const totalWarnings = stats.reduce(
    (sum, s) => sum + s.activeWarnings.length,
    0
  );
  const handleDateClick = (dateString) => {
    parseISO(dateString);
  };
  return /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-6", children: [
    /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold text-foreground", children: "Dashboard" }) }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "flex flex-row items-center justify-between pb-2", children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-medium text-muted-foreground", children: "Total Family Members" }),
          /* @__PURE__ */ jsx(IconUsers, { className: "h-4 w-4 text-muted-foreground" })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: state.members.length }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "flex flex-row items-center justify-between pb-2", children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-medium text-muted-foreground", children: "Currently Present" }),
          /* @__PURE__ */ jsx(IconPlane, { className: "h-4 w-4 text-muted-foreground" })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: activeTrips }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsxs(CardHeader, { className: "flex flex-row items-center justify-between pb-2", children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-sm font-medium text-muted-foreground", children: "Active Warnings" }),
          /* @__PURE__ */ jsx(IconAlertTriangle, { className: "h-4 w-4 text-muted-foreground" })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-warning", children: totalWarnings }) })
      ] })
    ] }),
    emptyPeriods.length > 0 && /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(IconCalendarOff, { className: "h-5 w-5" }),
        "Empty Periods (No Family Present)"
      ] }) }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "space-y-2", children: emptyPeriods.map((period, idx) => /* @__PURE__ */ jsx(Alert, { children: /* @__PURE__ */ jsxs(AlertDescription, { children: [
        /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
          format(parseISO(period.startDate), "MMM d, yyyy"),
          " -",
          " ",
          format(parseISO(period.endDate), "MMM d, yyyy")
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground ml-2", children: [
          "(",
          period.duration,
          " days)"
        ] })
      ] }) }, idx)) }) })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Members Overview" }) }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
        stats.map((member) => {
          return /* @__PURE__ */ jsxs(
            "div",
            {
              className: "border-b border-border pb-4 last:border-0 last:pb-0",
              children: [
                /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: "h-3 w-3 rounded-full",
                      style: { backgroundColor: member.color }
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("p", { className: "font-medium", children: member.name }),
                    /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
                      member.currentStatus === "present" ? "Currently present" : "Currently away",
                      member.nextTrip && /* @__PURE__ */ jsxs("span", { children: [
                        ", next:",
                        " ",
                        format(
                          parseISO(member.nextTrip.entryDate),
                          "MMM d"
                        )
                      ] })
                    ] })
                  ] })
                ] }) }),
                member.highlightTrips.length > 0 && /* @__PURE__ */ jsxs("div", { className: "ml-6 space-y-2", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-xs font-medium text-muted-foreground", children: "Trips highlight:" }),
                  member.highlightTrips.map((hightlightTrip) => /* @__PURE__ */ jsxs(
                    "div",
                    {
                      className: "flex items-center gap-2 text-sm",
                      children: [
                        /* @__PURE__ */ jsx(
                          "span",
                          {
                            className: "px-2 py-1 rounded bg-muted text-muted-foreground cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors",
                            onClick: () => handleDateClick(hightlightTrip.trip.entryDate),
                            title: "Click to set as reference date (1 year later if in past)",
                            children: format(
                              parseISO(hightlightTrip.trip.entryDate),
                              "MMM d, yyyy"
                            )
                          }
                        ),
                        /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "→" }),
                        /* @__PURE__ */ jsx(
                          "span",
                          {
                            className: "px-2 py-1 rounded bg-muted text-muted-foreground cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors",
                            onClick: () => handleDateClick(hightlightTrip.trip.departureDate),
                            title: "Click to set as reference date (1 year later if in past)",
                            children: format(
                              parseISO(hightlightTrip.trip.departureDate),
                              "MMM d, yyyy"
                            )
                          }
                        ),
                        hightlightTrip.trip.notes && /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
                          "(",
                          hightlightTrip.trip.notes,
                          ")"
                        ] }),
                        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                          /* @__PURE__ */ jsx("div", { className: "text-right", children: /* @__PURE__ */ jsxs("p", { className: `text-sm font-medium`, children: [
                            "Rolling year until",
                            " ",
                            format(hightlightTrip.refDate, "MMM d, yyyy"),
                            ": ",
                            /* @__PURE__ */ jsxs(
                              "span",
                              {
                                className: `${hightlightTrip.isOverLimit ? "text-error" : ""}`,
                                children: [
                                  hightlightTrip.daysInYear,
                                  " /",
                                  " ",
                                  state.globalSettings.yearLimit,
                                  " days"
                                ]
                              }
                            )
                          ] }) }),
                          hightlightTrip.isOverLimit && /* @__PURE__ */ jsx(Badge, { variant: "destructive", children: "Over Limit" }),
                          member.activeWarnings.length > 0 && !hightlightTrip.isOverLimit && /* @__PURE__ */ jsxs(Badge, { className: "bg-warning text-warning-foreground", children: [
                            member.activeWarnings.length,
                            " Warning",
                            member.activeWarnings.length > 1 ? "s" : ""
                          ] })
                        ] })
                      ]
                    },
                    hightlightTrip.trip.id
                  ))
                ] }),
                member.highlightTrips.length === 0 && /* @__PURE__ */ jsx("div", { className: "ml-6", children: /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "No trips within one year" }) })
              ]
            },
            member.memberId
          );
        }),
        stats.length === 0 && /* @__PURE__ */ jsx("p", { className: "text-center text-muted-foreground py-8", children: "No family members added yet" })
      ] }) })
    ] })
  ] });
}
function Dialog({ ...props }) {
  return /* @__PURE__ */ jsx(Dialog$1.Root, { "data-slot": "dialog", ...props });
}
function DialogPortal({ ...props }) {
  return /* @__PURE__ */ jsx(Dialog$1.Portal, { "data-slot": "dialog-portal", ...props });
}
function DialogOverlay({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Dialog$1.Backdrop,
    {
      "data-slot": "dialog-overlay",
      className: cn(
        "data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 bg-black/10 duration-100 supports-backdrop-filter:backdrop-blur-xs fixed inset-0 isolate z-50",
        className
      ),
      ...props
    }
  );
}
function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}) {
  return /* @__PURE__ */ jsxs(DialogPortal, { children: [
    /* @__PURE__ */ jsx(DialogOverlay, {}),
    /* @__PURE__ */ jsxs(
      Dialog$1.Popup,
      {
        "data-slot": "dialog-content",
        className: cn(
          "bg-background data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 ring-foreground/10 grid max-w-[calc(100%-2rem)] gap-4 rounded-xl p-4 text-sm ring-1 duration-100 sm:max-w-sm fixed top-1/2 left-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 outline-none",
          className
        ),
        ...props,
        children: [
          children,
          showCloseButton && /* @__PURE__ */ jsxs(
            Dialog$1.Close,
            {
              "data-slot": "dialog-close",
              render: /* @__PURE__ */ jsx(
                Button,
                {
                  variant: "ghost",
                  className: "absolute top-2 right-2",
                  size: "icon-sm"
                }
              ),
              children: [
                /* @__PURE__ */ jsx(IconX, {}),
                /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
              ]
            }
          )
        ]
      }
    )
  ] });
}
function DialogHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "dialog-header",
      className: cn("gap-2 flex flex-col", className),
      ...props
    }
  );
}
function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxs(
    "div",
    {
      "data-slot": "dialog-footer",
      className: cn(
        "bg-muted/50 -mx-4 -mb-4 rounded-b-xl border-t p-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      ),
      ...props,
      children: [
        children,
        showCloseButton && /* @__PURE__ */ jsx(Dialog$1.Close, { render: /* @__PURE__ */ jsx(Button, { variant: "outline" }), children: "Close" })
      ]
    }
  );
}
function DialogTitle({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    Dialog$1.Title,
    {
      "data-slot": "dialog-title",
      className: cn("text-sm leading-none font-medium", className),
      ...props
    }
  );
}
function Label({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "label",
    {
      "data-slot": "label",
      className: cn(
        "gap-2 text-sm leading-none font-medium group-data-[disabled=true]:opacity-50 peer-disabled:opacity-50 flex items-center select-none group-data-[disabled=true]:pointer-events-none peer-disabled:cursor-not-allowed",
        className
      ),
      ...props
    }
  );
}
const PRESET_COLORS = [
  "#8B5CF6",
  // Purple
  "#14B8A6",
  // Teal
  "#EC4899",
  // Pink
  "#F97316",
  // Orange
  "#3B82F6",
  // Blue
  "#10B981"
  // Green
];
function MemberDialog({ open, onClose, member }) {
  const { addMember, updateMember } = useFamilyPlanner();
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  useEffect(() => {
    if (member) {
      setName(member.name);
      setColor(member.color);
    } else {
      setName("");
      setColor(PRESET_COLORS[0]);
    }
  }, [member, open]);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (member) {
      updateMember(member.id, { name, color });
    } else {
      addMember({ name, color, warnings: [] });
    }
    onClose();
  };
  return /* @__PURE__ */ jsx(Dialog, { open, onOpenChange: onClose, children: /* @__PURE__ */ jsx(DialogContent, { children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
    /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: member ? "Edit Member" : "Add New Member" }) }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4 py-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "name", children: "Name" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "name",
            value: name,
            onChange: (e) => setName(e.target.value),
            placeholder: "Enter member name",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { children: "Color" }),
        /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: PRESET_COLORS.map((presetColor) => /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: `h-10 w-10 rounded-md border-2 ${color === presetColor ? "border-primary" : "border-border"}`,
            style: { backgroundColor: presetColor },
            onClick: () => setColor(presetColor)
          },
          presetColor
        )) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(DialogFooter, { children: [
      /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxs(Button, { type: "submit", children: [
        member ? "Update" : "Add",
        " Member"
      ] })
    ] })
  ] }) }) });
}
function Table({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "table-container",
      className: "relative w-full overflow-x-auto",
      children: /* @__PURE__ */ jsx(
        "table",
        {
          "data-slot": "table",
          className: cn("w-full caption-bottom text-sm", className),
          ...props
        }
      )
    }
  );
}
function TableHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "thead",
    {
      "data-slot": "table-header",
      className: cn("[&_tr]:border-b", className),
      ...props
    }
  );
}
function TableBody({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "tbody",
    {
      "data-slot": "table-body",
      className: cn("[&_tr:last-child]:border-0", className),
      ...props
    }
  );
}
function TableRow({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "tr",
    {
      "data-slot": "table-row",
      className: cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
        className
      ),
      ...props
    }
  );
}
function TableHead({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "th",
    {
      "data-slot": "table-head",
      className: cn(
        "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        className
      ),
      ...props
    }
  );
}
function TableCell({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "td",
    {
      "data-slot": "table-cell",
      className: cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        className
      ),
      ...props
    }
  );
}
function DropdownMenu({ ...props }) {
  return /* @__PURE__ */ jsx(Menu.Root, { "data-slot": "dropdown-menu", ...props });
}
function DropdownMenuTrigger({ ...props }) {
  return /* @__PURE__ */ jsx(Menu.Trigger, { "data-slot": "dropdown-menu-trigger", ...props });
}
function DropdownMenuContent({
  align = "start",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(Menu.Portal, { children: /* @__PURE__ */ jsx(
    Menu.Positioner,
    {
      className: "isolate z-50 outline-none",
      align,
      alignOffset,
      side,
      sideOffset,
      children: /* @__PURE__ */ jsx(
        Menu.Popup,
        {
          "data-slot": "dropdown-menu-content",
          className: cn(
            "data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 bg-popover text-popover-foreground min-w-32 rounded-lg p-1 shadow-md ring-1 duration-100 z-50 max-h-(--available-height) w-(--anchor-width) origin-(--transform-origin) overflow-x-hidden overflow-y-auto outline-none data-closed:overflow-hidden",
            className
          ),
          ...props
        }
      )
    }
  ) });
}
function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Menu.Item,
    {
      "data-slot": "dropdown-menu-item",
      "data-inset": inset,
      "data-variant": variant,
      className: cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:text-destructive not-data-[variant=destructive]:focus:**:text-accent-foreground gap-1.5 rounded-md px-1.5 py-1 text-sm [&_svg:not([class*='size-'])]:size-4 group/dropdown-menu-item relative flex cursor-default items-center outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      ),
      ...props
    }
  );
}
function MembersView() {
  const { state, deleteMember } = useFamilyPlanner();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const handleEdit = (member) => {
    setEditingMember(member);
    setDialogOpen(true);
  };
  const handleDelete = (id) => {
    if (confirm(
      "Are you sure you want to delete this member? All their trips will be removed."
    )) {
      deleteMember(id);
    }
  };
  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingMember(null);
  };
  return /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold text-foreground", children: "Family Members" }),
      /* @__PURE__ */ jsxs(Button, { onClick: () => setDialogOpen(true), children: [
        /* @__PURE__ */ jsx(IconPlus, { className: "h-4 w-4 mr-2" }),
        "Add Member"
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "All Members" }) }),
      /* @__PURE__ */ jsx(CardContent, { children: state.members.length > 0 ? /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableHead, { children: "Name" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Color" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Warnings" }),
          /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsx(TableBody, { children: state.members.map((member) => /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableCell, { className: "font-medium", children: member.name }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              "div",
              {
                className: "h-4 w-4 rounded-full border border-border",
                style: { backgroundColor: member.color }
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: member.color })
          ] }) }),
          /* @__PURE__ */ jsxs(TableCell, { children: [
            member.warnings.filter((w) => w.enabled).length,
            " active"
          ] }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxs(DropdownMenu, { children: [
            /* @__PURE__ */ jsx(DropdownMenuTrigger, { children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon-sm", children: /* @__PURE__ */ jsx(IconDotsVertical, { className: "h-4 w-4" }) }) }),
            /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "end", children: [
              /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => handleEdit(member), children: [
                /* @__PURE__ */ jsx(IconPencil, { className: "h-4 w-4 mr-2" }),
                "Edit"
              ] }),
              /* @__PURE__ */ jsxs(
                DropdownMenuItem,
                {
                  onClick: () => handleDelete(member.id),
                  variant: "destructive",
                  children: [
                    /* @__PURE__ */ jsx(IconTrash, { className: "h-4 w-4 mr-2" }),
                    "Delete"
                  ]
                }
              )
            ] })
          ] }) })
        ] }, member.id)) })
      ] }) : /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-4", children: "No family members yet" }),
        /* @__PURE__ */ jsxs(Button, { onClick: () => setDialogOpen(true), children: [
          /* @__PURE__ */ jsx(IconPlus, { className: "h-4 w-4 mr-2" }),
          "Add Your First Member"
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(
      MemberDialog,
      {
        open: dialogOpen,
        onClose: handleDialogClose,
        member: editingMember
      }
    )
  ] });
}
function Textarea({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "textarea",
    {
      "data-slot": "textarea",
      className: cn(
        "border-input dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 disabled:bg-input/50 dark:disabled:bg-input/80 rounded-lg border bg-transparent px-2.5 py-2 text-base transition-colors focus-visible:ring-[3px] aria-invalid:ring-[3px] md:text-sm placeholder:text-muted-foreground flex field-sizing-content min-h-16 w-full outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ...props
    }
  );
}
const Select = Select$1.Root;
function SelectValue({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    Select$1.Value,
    {
      "data-slot": "select-value",
      className: cn("flex flex-1 text-left", className),
      ...props
    }
  );
}
function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxs(
    Select$1.Trigger,
    {
      "data-slot": "select-trigger",
      "data-size": size,
      className: cn(
        "border-input data-[placeholder]:text-muted-foreground dark:bg-input/30 dark:hover:bg-input/50 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 gap-1.5 rounded-lg border bg-transparent py-2 pr-2 pl-2.5 text-sm transition-colors select-none focus-visible:ring-[3px] aria-invalid:ring-[3px] data-[size=default]:h-8 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] *:data-[slot=select-value]:flex *:data-[slot=select-value]:gap-1.5 [&_svg:not([class*='size-'])]:size-4 flex w-fit items-center justify-between whitespace-nowrap outline-none disabled:cursor-not-allowed disabled:opacity-50 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsx(
          Select$1.Icon,
          {
            render: /* @__PURE__ */ jsx(IconSelector, { className: "text-muted-foreground size-4 pointer-events-none" })
          }
        )
      ]
    }
  );
}
function SelectContent({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  alignItemWithTrigger = true,
  ...props
}) {
  return /* @__PURE__ */ jsx(Select$1.Portal, { children: /* @__PURE__ */ jsx(
    Select$1.Positioner,
    {
      side,
      sideOffset,
      align,
      alignOffset,
      alignItemWithTrigger,
      className: "isolate z-50",
      children: /* @__PURE__ */ jsxs(
        Select$1.Popup,
        {
          "data-slot": "select-content",
          className: cn(
            "bg-popover text-popover-foreground data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 ring-foreground/10 min-w-36 rounded-lg shadow-md ring-1 duration-100 relative isolate z-50 max-h-(--available-height) w-(--anchor-width) origin-(--transform-origin) overflow-x-hidden overflow-y-auto",
            className
          ),
          ...props,
          children: [
            /* @__PURE__ */ jsx(SelectScrollUpButton, {}),
            /* @__PURE__ */ jsx(Select$1.List, { children }),
            /* @__PURE__ */ jsx(SelectScrollDownButton, {})
          ]
        }
      )
    }
  ) });
}
function SelectItem({
  className,
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxs(
    Select$1.Item,
    {
      "data-slot": "select-item",
      className: cn(
        "focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2 relative flex w-full cursor-default items-center outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      ),
      ...props,
      children: [
        /* @__PURE__ */ jsx(Select$1.ItemText, { className: "flex flex-1 gap-2 shrink-0 whitespace-nowrap", children }),
        /* @__PURE__ */ jsx(
          Select$1.ItemIndicator,
          {
            render: /* @__PURE__ */ jsx("span", { className: "pointer-events-none absolute right-2 flex size-4 items-center justify-center" }),
            children: /* @__PURE__ */ jsx(IconCheck, { className: "pointer-events-none" })
          }
        )
      ]
    }
  );
}
function SelectScrollUpButton({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Select$1.ScrollUpArrow,
    {
      "data-slot": "select-scroll-up-button",
      className: cn(
        "bg-popover z-10 flex cursor-default items-center justify-center py-1 [&_svg:not([class*='size-'])]:size-4 top-0 w-full",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsx(IconChevronUp, {})
    }
  );
}
function SelectScrollDownButton({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Select$1.ScrollDownArrow,
    {
      "data-slot": "select-scroll-down-button",
      className: cn(
        "bg-popover z-10 flex cursor-default items-center justify-center py-1 [&_svg:not([class*='size-'])]:size-4 bottom-0 w-full",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsx(IconChevronDown, {})
    }
  );
}
function TripDialog({ open, onClose, trip }) {
  const { state, addTrip, updateTrip, deleteTrip } = useFamilyPlanner();
  const [memberIds, setMemberIds] = useState([]);
  const [entryDate, setEntryDate] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [notes, setNotes] = useState("");
  useEffect(() => {
    if (trip) {
      setMemberIds(trip.memberIds);
      setEntryDate(trip.entryDate);
      setDepartureDate(trip.departureDate);
      setNotes(trip.notes || "");
    } else {
      setMemberIds(state.members[0] ? [state.members[0].id] : []);
      setEntryDate(format(/* @__PURE__ */ new Date(), "yyyy-MM-dd"));
      setDepartureDate(format(/* @__PURE__ */ new Date(), "yyyy-MM-dd"));
      setNotes("");
    }
  }, [trip, open, state.members]);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (memberIds.length === 0 || !entryDate || !departureDate) return;
    const tripData = {
      memberIds,
      entryDate,
      departureDate,
      notes: notes || void 0
    };
    if (trip) {
      updateTrip(trip.id, tripData);
    } else {
      addTrip(tripData);
    }
    onClose();
  };
  const handleDelete = () => {
    if (trip && confirm("Are you sure you want to delete this trip?")) {
      deleteTrip(trip.id);
      onClose();
    }
  };
  return /* @__PURE__ */ jsx(Dialog, { open, onOpenChange: onClose, children: /* @__PURE__ */ jsx(DialogContent, { children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
    /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: trip ? "Edit Trip" : "Add New Trip" }) }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4 py-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "member", children: "Family Member(s)" }),
        /* @__PURE__ */ jsxs(
          Select,
          {
            multiple: true,
            value: memberIds,
            onValueChange: (value) => Array.isArray(value) ? setMemberIds(value) : setMemberIds([value]),
            children: [
              /* @__PURE__ */ jsx(SelectTrigger, { id: "member", children: /* @__PURE__ */ jsx(SelectValue, { children: () => {
                if (memberIds.length === 0) return null;
                return /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: memberIds.map((id, idx) => {
                  const member = state.members.find(
                    (m) => m.id === id
                  );
                  if (!member) return null;
                  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx(
                      "div",
                      {
                        className: "h-3 w-3 rounded-full",
                        style: { backgroundColor: member.color }
                      }
                    ),
                    /* @__PURE__ */ jsxs("span", { className: "text-sm", children: [
                      member.name,
                      idx < memberIds.length - 1 ? ", " : ""
                    ] })
                  ] }, id);
                }) });
              } }) }),
              /* @__PURE__ */ jsx(SelectContent, { children: state.members.map((member) => /* @__PURE__ */ jsx(SelectItem, { value: member.id, children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "h-3 w-3 rounded-full",
                    style: { backgroundColor: member.color }
                  }
                ),
                member.name
              ] }) }, member.id)) })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "entry", children: "Entry Date" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "entry",
              type: "date",
              value: entryDate,
              onChange: (e) => setEntryDate(e.target.value),
              required: true
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "departure", children: "Departure Date" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "departure",
              type: "date",
              value: departureDate,
              onChange: (e) => setDepartureDate(e.target.value),
              required: true
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "notes", children: "Notes (Optional)" }),
        /* @__PURE__ */ jsx(
          Textarea,
          {
            id: "notes",
            value: notes,
            onChange: (e) => setNotes(e.target.value),
            placeholder: "Add any notes about this trip...",
            rows: 3
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs(DialogFooter, { className: "gap-2", children: [
      trip && /* @__PURE__ */ jsx(
        Button,
        {
          type: "button",
          variant: "destructive",
          onClick: handleDelete,
          children: "Delete"
        }
      ),
      /* @__PURE__ */ jsx(Button, { type: "button", variant: "outline", onClick: onClose, children: "Cancel" }),
      /* @__PURE__ */ jsxs(Button, { type: "submit", children: [
        trip ? "Update" : "Add",
        " Trip"
      ] })
    ] })
  ] }) }) });
}
function Tabs({
  className,
  orientation = "horizontal",
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Tabs$1.Root,
    {
      "data-slot": "tabs",
      "data-orientation": orientation,
      className: cn(
        "gap-2 group/tabs flex data-[orientation=horizontal]:flex-col",
        className
      ),
      ...props
    }
  );
}
const tabsListVariants = cva(
  "rounded-lg p-[3px] group-data-horizontal/tabs:h-8 data-[variant=line]:rounded-none group/tabs-list text-muted-foreground inline-flex w-fit items-center justify-center group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function TabsList({
  className,
  variant = "default",
  ...props
}) {
  return /* @__PURE__ */ jsx(
    Tabs$1.List,
    {
      "data-slot": "tabs-list",
      "data-variant": variant,
      className: cn(tabsListVariants({ variant }), className),
      ...props
    }
  );
}
function TabsTrigger({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    Tabs$1.Tab,
    {
      "data-slot": "tabs-trigger",
      className: cn(
        "gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-sm font-medium group-data-[variant=default]/tabs-list:data-active:shadow-sm group-data-[variant=line]/tabs-list:data-active:shadow-none [&_svg:not([class*='size-'])]:size-4 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring text-foreground/60 hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center whitespace-nowrap transition-all group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent",
        "data-active:bg-background dark:data-active:text-foreground dark:data-active:border-input dark:data-active:bg-input/30 data-active:text-foreground",
        "after:bg-foreground after:absolute after:opacity-0 after:transition-opacity group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-[-5px] group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
        className
      ),
      ...props
    }
  );
}
function TabsContent({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    Tabs$1.Panel,
    {
      "data-slot": "tabs-content",
      className: cn("text-sm flex-1 outline-none", className),
      ...props
    }
  );
}
function CalendarView() {
  const { state } = useFamilyPlanner();
  const [currentDate, setCurrentDate] = useState(/* @__PURE__ */ new Date());
  const [yearViewStartDate, setYearViewStartDate] = useState(/* @__PURE__ */ new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleYearViewPrevMonth = () => setYearViewStartDate(subMonths(yearViewStartDate, 1));
  const handleYearViewNextMonth = () => setYearViewStartDate(addMonths(yearViewStartDate, 1));
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const getTripsForDay = (date) => {
    return state.trips.filter((trip) => {
      const start = parseISO(trip.entryDate);
      const end = parseISO(trip.departureDate);
      return isWithinInterval(date, { start, end });
    });
  };
  const handleEditTrip = (trip) => {
    setEditingTrip(trip);
    setDialogOpen(true);
  };
  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingTrip(null);
  };
  return /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold text-foreground", children: "Calendar" }),
      /* @__PURE__ */ jsxs(Button, { onClick: () => setDialogOpen(true), children: [
        /* @__PURE__ */ jsx(IconPlus, { className: "h-4 w-4 mr-2" }),
        "Add Trip"
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Tabs, { defaultValue: "month", children: [
      /* @__PURE__ */ jsxs(TabsList, { children: [
        /* @__PURE__ */ jsx(TabsTrigger, { value: "month", children: "Monthly View" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "year", children: "Yearly View" })
      ] }),
      /* @__PURE__ */ jsx(TabsContent, { value: "month", className: "mt-6", children: /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx(CardTitle, { children: format(currentDate, "MMMM yyyy") }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(
              Button,
              {
                variant: "outline",
                size: "icon-sm",
                onClick: handlePrevMonth,
                children: /* @__PURE__ */ jsx(IconChevronLeft, { className: "h-4 w-4" })
              }
            ),
            /* @__PURE__ */ jsx(
              Button,
              {
                variant: "outline",
                size: "icon-sm",
                onClick: handleNextMonth,
                children: /* @__PURE__ */ jsx(IconChevronRight, { className: "h-4 w-4" })
              }
            )
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-7 gap-2", children: [
          ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
            (day) => /* @__PURE__ */ jsx(
              "div",
              {
                className: "text-center font-medium text-sm text-muted-foreground p-2",
                children: day
              },
              day
            )
          ),
          Array.from({ length: monthStart.getDay() }).map((_, i) => /* @__PURE__ */ jsx("div", { className: "p-2" }, `empty-${i}`)),
          daysInMonth.map((day) => {
            const trips = getTripsForDay(day);
            return /* @__PURE__ */ jsxs(
              "div",
              {
                className: `min-h-24 p-2 border rounded-md ${isSameMonth(day, currentDate) ? "bg-card" : "bg-muted/50"}`,
                children: [
                  /* @__PURE__ */ jsx("div", { className: "text-sm font-medium mb-1", children: format(day, "d") }),
                  /* @__PURE__ */ jsx("div", { className: "space-y-1", children: trips.flatMap(
                    (trip) => trip.memberIds.map((mid) => {
                      const member = state.members.find(
                        (m) => m.id === mid
                      );
                      if (!member) return null;
                      return /* @__PURE__ */ jsx(
                        "div",
                        {
                          className: "text-xs p-1 rounded cursor-pointer hover:opacity-80",
                          style: {
                            backgroundColor: member.color,
                            color: "white"
                          },
                          onClick: () => handleEditTrip(trip),
                          title: `${member.name}
${trip.notes || ""}`,
                          children: member.name
                        },
                        `${trip.id}-${mid}`
                      );
                    })
                  ) })
                ]
              },
              day.toISOString()
            );
          })
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsxs(TabsContent, { value: "year", className: "mt-6", children: [
        /* @__PURE__ */ jsx(Card, { className: "mb-4", children: /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs(CardTitle, { children: [
            format(yearViewStartDate, "MMMM yyyy"),
            " -",
            " ",
            format(addMonths(yearViewStartDate, 11), "MMMM yyyy")
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(
              Button,
              {
                variant: "outline",
                size: "icon-sm",
                onClick: handleYearViewPrevMonth,
                children: /* @__PURE__ */ jsx(IconChevronLeft, { className: "h-4 w-4" })
              }
            ),
            /* @__PURE__ */ jsx(
              Button,
              {
                variant: "outline",
                size: "icon-sm",
                onClick: handleYearViewNextMonth,
                children: /* @__PURE__ */ jsx(IconChevronRight, { className: "h-4 w-4" })
              }
            )
          ] })
        ] }) }) }),
        /* @__PURE__ */ jsx("div", { className: "grid gap-4 md:grid-cols-3", children: Array.from({ length: 12 }).map((_, monthIdx) => {
          const monthDate = addMonths(yearViewStartDate, monthIdx);
          const start = startOfMonth(monthDate);
          const end = endOfMonth(monthDate);
          const days = eachDayOfInterval({ start, end });
          return /* @__PURE__ */ jsxs(Card, { children: [
            /* @__PURE__ */ jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsx(CardTitle, { className: "text-base", children: format(monthDate, "MMMM") }) }),
            /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-7 gap-1", children: [
              ["S", "M", "T", "W", "T", "F", "S"].map((day, i) => /* @__PURE__ */ jsx(
                "div",
                {
                  className: "text-center text-xs text-muted-foreground",
                  children: day
                },
                i
              )),
              Array.from({ length: start.getDay() }).map((_2, i) => /* @__PURE__ */ jsx("div", { className: "aspect-square" }, `empty-${i}`)),
              days.map((day) => {
                const trips = getTripsForDay(day);
                const colors = trips.flatMap((t) => t.memberIds.map((id) => id)).map(
                  (id) => state.members.find((m) => m.id === id)?.color
                ).filter(Boolean);
                return /* @__PURE__ */ jsxs(
                  "div",
                  {
                    className: "aspect-square flex items-center justify-center text-xs rounded relative overflow-hidden",
                    children: [
                      colors.length > 0 && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex", children: colors.map((color, idx) => /* @__PURE__ */ jsx(
                        "div",
                        {
                          className: "flex-1",
                          style: { backgroundColor: color }
                        },
                        idx
                      )) }),
                      /* @__PURE__ */ jsx(
                        "span",
                        {
                          className: `relative z-10 font-medium ${colors.length > 0 ? "text-white" : "text-foreground"}`,
                          children: format(day, "d")
                        }
                      )
                    ]
                  },
                  day.toISOString()
                );
              })
            ] }) })
          ] }, monthIdx);
        }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      TripDialog,
      {
        open: dialogOpen,
        onClose: handleDialogClose,
        trip: editingTrip
      }
    )
  ] });
}
function SettingsView() {
  const { state, updateGlobalSettings, importData, exportData } = useFamilyPlanner();
  const [yearLimit, setYearLimit] = useState(state.globalSettings.yearLimit);
  const handleYearLimitChange = (value) => {
    setYearLimit(value);
    updateGlobalSettings({ yearLimit: value });
  };
  const handleExportCSV = () => {
    const csvRows = ["Member,Entry Date,Departure Date,Notes"];
    state.trips.forEach((trip) => {
      trip.memberIds.forEach((mid) => {
        const member = state.members.find((m) => m.id === mid);
        if (member) {
          csvRows.push(
            `${member.name},${trip.entryDate},${trip.departureDate},"${trip.notes || ""}"`
          );
        }
      });
    });
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `family-visits-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const handleImportCSV = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      const rows = text.split("\n").slice(1);
      rows.forEach((row) => {
        const [memberName] = row.split(",").map((s) => s.trim().replace(/"/g, ""));
        state.members.find((m) => m.name === memberName);
      });
      alert(
        "CSV import is currently limited. Please use JSON import for full data."
      );
    };
    reader.readAsText(file);
  };
  const handleExportJSON = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `family-planner-${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result);
        importData(data);
        alert("Data imported successfully!");
      } catch (error) {
        alert("Error importing data. Please check the file format.");
      }
    };
    reader.readAsText(file);
  };
  const handleShareURL = () => {
    const data = exportData();
    console.log("data", data);
    const encoded = encodeURIComponent(JSON.stringify(data));
    const url = `${window.location.origin}?data=${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      alert("Shareable link copied to clipboard!");
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-6", children: [
    /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold text-foreground", children: "Settings" }) }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsx(CardTitle, { children: "General Settings" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Configure global application settings" })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { className: "space-y-4", children: /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "yearLimit", children: "Maximum Days Per Year" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "yearLimit",
            type: "number",
            value: yearLimit,
            onChange: (e) => handleYearLimitChange(Number(e.target.value)),
            min: 1,
            max: 365
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Members staying more than this will be flagged as over limit" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsx(CardTitle, { children: "Data Management" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Import, export, and share your planning data" })
      ] }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-medium", children: "Export Data" }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
              /* @__PURE__ */ jsxs(
                Button,
                {
                  onClick: handleExportJSON,
                  variant: "outline",
                  className: "w-full",
                  children: [
                    /* @__PURE__ */ jsx(IconDownload, { className: "h-4 w-4 mr-2" }),
                    "Export as JSON"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                Button,
                {
                  onClick: handleExportCSV,
                  variant: "outline",
                  className: "w-full",
                  children: [
                    /* @__PURE__ */ jsx(IconDownload, { className: "h-4 w-4 mr-2" }),
                    "Export as CSV"
                  ]
                }
              ),
              /* @__PURE__ */ jsxs(
                Button,
                {
                  onClick: handleShareURL,
                  variant: "outline",
                  className: "w-full",
                  children: [
                    /* @__PURE__ */ jsx(IconShare, { className: "h-4 w-4 mr-2" }),
                    "Copy Shareable Link"
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-medium", children: "Import Data" }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
              /* @__PURE__ */ jsxs(Label, { htmlFor: "import-json", className: "cursor-pointer", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center w-full px-4 py-2 border border-input rounded-md hover:bg-accent", children: [
                  /* @__PURE__ */ jsx(IconUpload, { className: "h-4 w-4 mr-2" }),
                  "Import JSON File"
                ] }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    id: "import-json",
                    type: "file",
                    accept: ".json",
                    className: "hidden",
                    onChange: handleImportJSON
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs(Label, { htmlFor: "import-csv", className: "cursor-pointer", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center w-full px-4 py-2 border border-input rounded-md hover:bg-accent", children: [
                  /* @__PURE__ */ jsx(IconUpload, { className: "h-4 w-4 mr-2" }),
                  "Import CSV File"
                ] }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    id: "import-csv",
                    type: "file",
                    accept: ".csv",
                    className: "hidden",
                    onChange: handleImportCSV
                  }
                )
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "pt-4 border-t", children: /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsx("strong", { children: "Note:" }),
          " Importing data will replace your current data. Make sure to export a backup first."
        ] }) })
      ] })
    ] })
  ] });
}
function App() {
  const [activeSection, setActiveSection] = useState("dashboard");
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const dataParam = urlParams.get("data");
    if (dataParam) {
      try {
        const decoded = JSON.parse(decodeURI(dataParam));
        localStorage.setItem("family-planner-data", JSON.stringify(decoded));
        window.location.href = "/";
      } catch (error) {
        console.error("Error loading shared data:", error);
      }
    }
  }, []);
  return /* @__PURE__ */ jsx(FamilyPlannerProvider, { children: /* @__PURE__ */ jsxs(DashboardLayout, { activeSection, onSectionChange: setActiveSection, children: [
    activeSection === "dashboard" && /* @__PURE__ */ jsx(DashboardView, {}),
    activeSection === "members" && /* @__PURE__ */ jsx(MembersView, {}),
    activeSection === "calendar" && /* @__PURE__ */ jsx(CalendarView, {}),
    activeSection === "settings" && /* @__PURE__ */ jsx(SettingsView, {})
  ] }) });
}
export {
  App as component
};
