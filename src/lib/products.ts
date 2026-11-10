import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Boxes,
  Building,
  Building2,
  Calculator,
  CalendarCheck,
  ChefHat,
  ClipboardList,
  Cog,
  CookingPot,
  Gauge,
  ShoppingBag,
  ShoppingCart,
  UtensilsCrossed,
  Users,
  Wrench,
} from "lucide-react";

/**
 * Single source of truth for the AGMA product suite.
 * Copy is grounded in the company's official product descriptions —
 * no invented features, statistics, clients or screenshots.
 */

export type Capability = {
  icon: LucideIcon;
  label: string;
  text: string;
};

export type Product = {
  slug: string;
  index: string;
  name: string;
  full: string;
  icon: LucideIcon;
  /** Short scope line used in compact panels */
  scope: string;
  description: string;
  capabilities: Capability[];
  /** Value bullets derived from the official product description */
  outcomes: string[];
  /** Per-product accent line (existing brand shades only) */
  accent: string;
};

export const PRODUCTS: Product[] = [
  {
    slug: "agma-erp",
    index: "01",
    name: "AGMA ERP",
    full: "Enterprise Resource Planning",
    icon: Boxes,
    scope: "Finance · HR · Inventory · Procurement",
    description:
      "An integrated enterprise management solution designed to centralize business operations, streamline workflows, and provide better control over organizational resources.",
    capabilities: [
      {
        icon: Calculator,
        label: "Finance & Accounting",
        text: "Keep financial data accurate and centralized — from daily transactions to reporting.",
      },
      {
        icon: Users,
        label: "Human Resources & Payroll",
        text: "Manage employee records, payroll cycles and HR processes in one system.",
      },
      {
        icon: Boxes,
        label: "Inventory Management",
        text: "Track stock levels, movements and availability across your operations.",
      },
      {
        icon: ShoppingCart,
        label: "Procurement",
        text: "Structure purchasing from request to order, with clear visibility at every step.",
      },
      {
        icon: Cog,
        label: "Operations Management",
        text: "Coordinate day-to-day operational activities within a single platform.",
      },
      {
        icon: BarChart3,
        label: "Reporting & Analytics",
        text: "Turn operational data into clear reports that support better decisions.",
      },
    ],
    outcomes: [
      "Centralized business operations",
      "Streamlined, automated workflows",
      "Better control over organizational resources",
    ],
    accent: "from-brand-600",
  },
  {
    slug: "agma-cafm",
    index: "02",
    name: "AGMA CAFM",
    full: "Computer-Aided Facility Management",
    icon: Building2,
    scope: "Assets · Maintenance · Work Orders",
    description:
      "A comprehensive facility management solution that helps organizations manage buildings, assets, maintenance activities, and facility operations efficiently.",
    capabilities: [
      {
        icon: Building2,
        label: "Asset Management",
        text: "Maintain a complete, structured record of your buildings and assets.",
      },
      {
        icon: Wrench,
        label: "Preventive & Corrective Maintenance",
        text: "Plan preventive schedules and resolve corrective issues before they escalate.",
      },
      {
        icon: ClipboardList,
        label: "Work Order Management",
        text: "Create, assign and follow work orders from request to completion.",
      },
      {
        icon: Building,
        label: "Facility Operations",
        text: "Organize the day-to-day running of your facilities in one place.",
      },
      {
        icon: CalendarCheck,
        label: "Maintenance Planning",
        text: "Schedule maintenance activities and keep teams aligned on priorities.",
      },
      {
        icon: Gauge,
        label: "Performance Monitoring",
        text: "Monitor facility performance with clear operational indicators.",
      },
    ],
    outcomes: [
      "Efficient management of buildings and assets",
      "Structured preventive and corrective maintenance",
      "Full visibility of facility operations",
    ],
    accent: "from-brand-400",
  },
  {
    slug: "agma-catering",
    index: "03",
    name: "AGMA CATERING",
    full: "Catering Management System",
    icon: UtensilsCrossed,
    scope: "Meals · Kitchen · Orders",
    description:
      "An integrated catering management solution that streamlines meal planning, food services, ordering, kitchen operations, and catering workflows.",
    capabilities: [
      {
        icon: UtensilsCrossed,
        label: "Meal Management",
        text: "Plan menus and manage meal service across your operations.",
      },
      {
        icon: ChefHat,
        label: "Catering Operations",
        text: "Coordinate catering activities from planning to service delivery.",
      },
      {
        icon: ShoppingBag,
        label: "Employee Meal Ordering",
        text: "Give employees a simple, structured way to order their meals.",
      },
      {
        icon: CookingPot,
        label: "Kitchen Management",
        text: "Organize kitchen workflows and keep food preparation on schedule.",
      },
      {
        icon: ClipboardList,
        label: "Order Management",
        text: "Handle incoming orders in one clear, structured pipeline.",
      },
      {
        icon: BarChart3,
        label: "Operational Reporting",
        text: "Gain clear insight into catering activity and performance.",
      },
    ],
    outcomes: [
      "Streamlined meal planning and food services",
      "Organized ordering and kitchen operations",
      "Smoother end-to-end catering workflows",
    ],
    accent: "from-brand-300",
  },
];

export function getProduct(slug: string): Product {
  const product = PRODUCTS.find((p) => p.slug === slug);
  if (!product) throw new Error(`Unknown product: ${slug}`);
  return product;
}

export function getSiblingProducts(slug: string): Product[] {
  return PRODUCTS.filter((p) => p.slug !== slug);
}
