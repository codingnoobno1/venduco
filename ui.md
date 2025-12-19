<<<<<<< HEAD
# UI Components & Design System

## 🎨 Overview

This document defines the **complete UI component library** for VendorConnect. All components follow a **consistent design system** with reusable patterns, accessibility standards (WCAG 2.1 AA), and mobile-first responsive design.

---

## 🏗️ Component Architecture

### Directory Structure

```
src/components/
├── ui/                          ← Base UI primitives (shadcn/ui style)
│   ├── button.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── textarea.tsx
│   ├── card.tsx
│   ├── badge.tsx
│   ├── avatar.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── toast.tsx
│   └── ...
│
├── portfolio/                   ← Public site components
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── HeroSection.tsx
│   ├── FeatureGrid.tsx
│   ├── FeatureCard.tsx
│   ├── PricingCard.tsx
│   ├── Testimonials.tsx
│   ├── CTASection.tsx
│   └── ContactForm.tsx
│
├── dashboards/                  ← Dashboard-specific widgets
│   ├── MetricCard.tsx
│   ├── ChartCard.tsx
│   ├── ActivityFeed.tsx
│   ├── TaskListWidget.tsx
│   ├── AlertsWidget.tsx
│   ├── ProgressBar.tsx
│   ├── StatusBadge.tsx
│   └── QuickActions.tsx
│
├── app/                         ← App shell components
│   ├── AppSidebar.tsx
│   ├── AppTopBar.tsx
│   ├── UserMenu.tsx
│   ├── ProjectSwitcher.tsx
│   └── NotificationBell.tsx
│
├── forms/                       ← Form components
│   ├── LoginForm.tsx
│   ├── ProjectForm.tsx
│   ├── TaskForm.tsx
│   ├── InventoryForm.tsx
│   └── FormField.tsx
│
└── charts/                      ← Data visualization
    ├── LineChart.tsx
    ├── BarChart.tsx
    ├── PieChart.tsx
    ├── AreaChart.tsx
    └── GanttChart.tsx
```

---

## 🎨 Design System Tokens

### Color Palette

```typescript
// src/styles/colors.ts
export const colors = {
  // Primary (Blue - Trust & Professionalism)
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',  // Main brand color
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Secondary (Amber - Construction theme)
  secondary: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',  // Accent color
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  // Success (Green)
  success: {
    50: '#f0fdf4',
    500: '#10b981',
    700: '#047857',
  },
  
  // Warning (Orange)
  warning: {
    50: '#fff7ed',
    500: '#f97316',
    700: '#c2410c',
  },
  
  // Error (Red)
  error: {
    50: '#fef2f2',
    500: '#ef4444',
    700: '#b91c1c',
  },
  
  // Neutral (Grays)
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },
};
```

### Typography Scale

```typescript
// src/styles/typography.ts
export const typography = {
  fontFamily: {
    sans: 'var(--font-geist-sans)',
    mono: 'var(--font-geist-mono)',
  },
  
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
  },
  
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};
```

### Spacing Scale

```typescript
// src/styles/spacing.ts
export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
};
```

### Border Radius

```typescript
export const borderRadius = {
  none: '0',
  sm: '0.25rem',   // 4px
  md: '0.375rem',  // 6px
  lg: '0.5rem',    // 8px
  xl: '0.75rem',   // 12px
  '2xl': '1rem',   // 16px
  full: '9999px',
};
```

### Shadows

```typescript
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
};
```

---

## 🧩 Base UI Components

### Button Component

```tsx
// src/components/ui/button.tsx
import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center rounded-lg font-medium',
          'transition-colors focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none',
          
          // Variants
          {
            'bg-primary-600 text-white hover:bg-primary-700': variant === 'primary',
            'bg-secondary-500 text-white hover:bg-secondary-600': variant === 'secondary',
            'border border-neutral-300 bg-white hover:bg-neutral-50': variant === 'outline',
            'hover:bg-neutral-100': variant === 'ghost',
            'bg-error-600 text-white hover:bg-error-700': variant === 'destructive',
          },
          
          // Sizes
          {
            'h-9 px-3 text-sm': size === 'sm',
            'h-11 px-5 text-base': size === 'md',
            'h-14 px-7 text-lg': size === 'lg',
          },
          
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <LoadingSpinner className="mr-2 h-4 w-4" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

**Usage**:
```tsx
<Button variant="primary" size="md" onClick={handleClick}>
  Save Changes
</Button>

<Button variant="outline" isLoading={loading}>
  Submit
</Button>
```

---

### Input Component

```tsx
// src/components/ui/input.tsx
import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            {label}
            {props.required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            'flex h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2',
            'text-base text-neutral-900 placeholder:text-neutral-400',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-error-500 focus:ring-error-500',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-error-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

**Usage**:
```tsx
<Input
  label="Email Address"
  type="email"
  placeholder="you@example.com"
  error={errors.email}
  required
/>
```

---

### Card Component

```tsx
// src/components/ui/card.tsx
import { cn } from '@/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl border border-neutral-200 bg-white shadow-sm',
          className
        )}
        {...props}
      />
    );
  }
);

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col space-y-1.5 p-6', className)}
        {...props}
      />
    );
  }
);

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
        {...props}
      />
    );
  }
);

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
    );
  }
);
```

**Usage**:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Project Summary</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Content goes here...</p>
  </CardContent>
</Card>
```

---

## 📱 Portfolio Components

### Navbar Component

```tsx
// src/components/portfolio/Navbar.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

export function PortfolioNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navLinks = [
    { href: '/features', label: 'Features' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-primary-600" />
          <span className="text-xl font-bold text-neutral-900">VendorConnect</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:items-center md:space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        
        {/* CTA Button */}
        <div className="hidden md:block">
          <Button asChild>
            <Link href="/login">Handle Project</Link>
          </Button>
        </div>
        
        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white">
          <nav className="container mx-auto flex flex-col space-y-4 px-4 py-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-base font-medium text-neutral-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Button asChild className="w-full">
              <Link href="/login">Handle Project</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
```

---

### Feature Card Component

```tsx
// src/components/portfolio/FeatureCard.tsx
import { LucideIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
          <Icon className="h-6 w-6 text-primary-600" />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-neutral-600">{description}</p>
      </CardContent>
    </Card>
  );
}
```

**Usage**:
```tsx
import { Calendar, Warehouse, Users } from 'lucide-react';

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <FeatureCard
    icon={Calendar}
    title="Smart Scheduling"
    description="AI-powered task allocation across vendors and machines"
  />
  <FeatureCard
    icon={Warehouse}
    title="Inventory Tracking"
    description="Real-time stock levels and automatic reorder alerts"
  />
  <FeatureCard
    icon={Users}
    title="Role-Based Access"
    description="6 distinct roles with granular permissions"
  />
</div>
```

---

## 📊 Dashboard Components

### Metric Card Component

```tsx
// src/components/dashboards/MetricCard.tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
}

export function MetricCard({ title, value, change, changeType = 'neutral', icon: Icon }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-neutral-600">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-neutral-400" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-neutral-900">{value}</div>
        {change && (
          <p className={cn(
            'text-xs mt-1',
            {
              'text-success-600': changeType === 'positive',
              'text-error-600': changeType === 'negative',
              'text-neutral-600': changeType === 'neutral',
            }
          )}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```

**Usage**:
```tsx
import { Users, TrendingUp } from 'lucide-react';

<MetricCard
  title="Active Users"
  value={247}
  change="+18 this week"
  changeType="positive"
  icon={Users}
/>
```

---

### Task List Widget

```tsx
// src/components/dashboards/TaskListWidget.tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Task {
  id: string;
  title: string;
  assignee: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  deadline: string;
}

interface TaskListWidgetProps {
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
}

export function TaskListWidget({ tasks, onTaskClick }: TaskListWidgetProps) {
  const statusColors = {
    pending: 'bg-neutral-100 text-neutral-800',
    'in-progress': 'bg-primary-100 text-primary-800',
    completed: 'bg-success-100 text-success-800',
  };
  
  const priorityColors = {
    low: 'bg-neutral-100 text-neutral-800',
    medium: 'bg-warning-100 text-warning-800',
    high: 'bg-error-100 text-error-800',
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-4 rounded-lg border border-neutral-200 hover:border-primary-300 transition-colors cursor-pointer"
              onClick={() => onTaskClick(task.id)}
            >
              <div className="flex-1">
                <h4 className="font-medium text-neutral-900">{task.title}</h4>
                <p className="text-sm text-neutral-600 mt-1">
                  Assigned to: {task.assignee}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={priorityColors[task.priority]}>
                  {task.priority}
                </Badge>
                <Badge className={statusColors[task.status]}>
                  {task.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 📈 Chart Components

### Bar Chart Component (using Recharts)

```tsx
// src/components/charts/BarChart.tsx
'use client';

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BarChartProps {
  data: { name: string; value: number }[];
  color?: string;
}

export function BarChart({ data, color = '#3b82f6' }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsBarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill={color} radius={[8, 8, 0, 0]} />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
```

**Usage**:
```tsx
const data = [
  { name: 'Jan', value: 45 },
  { name: 'Feb', value: 60 },
  { name: 'Mar', value: 80 },
];

<BarChart data={data} color="#10b981" />
```

---

## 🔔 App Shell Components

### App Sidebar

```tsx
// src/components/app/AppSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Calendar, Truck, Users, Package, BarChart, Settings } from 'lucide-react';

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export function AppSidebar() {
  const pathname = usePathname();
  
  const links: SidebarLink[] = [
    { href: '/app/proj-123/dashboards/admin', label: 'Dashboard', icon: <Home size={20} /> },
    { href: '/app/proj-123/scheduling', label: 'Scheduling', icon: <Calendar size={20} /> },
    { href: '/app/proj-123/machines', label: 'Machines', icon: <Truck size={20} /> },
    { href: '/app/proj-123/users', label: 'Team', icon: <Users size={20} /> },
    { href: '/app/proj-123/warehouse', label: 'Warehouse', icon: <Package size={20} /> },
    { href: '/app/proj-123/reports', label: 'Reports', icon: <BarChart size={20} /> },
    { href: '/app/proj-123/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];
  
  return (
    <aside className="w-64 border-r border-neutral-200 bg-white">
      <div className="p-6">
        <h2 className="text-lg font-bold text-neutral-900">VendorConnect</h2>
      </div>
      <nav className="space-y-1 px-3">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              )}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

---

## ♿ Accessibility Guidelines

### ARIA Labels

```tsx
// Always include aria-label for icon-only buttons
<button aria-label="Close dialog">
  <X />
</button>

// Use aria-describedby for error messages
<input
  id="email"
  aria-describedby="email-error"
  aria-invalid={!!error}
/>
{error && <span id="email-error" role="alert">{error}</span>}
```

### Keyboard Navigation

All interactive components support:
- **Tab**: Navigate forward
- **Shift+Tab**: Navigate backward
- **Enter/Space**: Activate buttons
- **Escape**: Close modals/dropdowns

### Focus Management

```tsx
// Trap focus inside modals
import { Dialog } from '@headlessui/react';

<Dialog onClose={handleClose}>
  <Dialog.Panel>
    {/* Focus is automatically trapped */}
  </Dialog.Panel>
</Dialog>
```

---

## 📱 Responsive Design Patterns

### Mobile-First Breakpoints

```tsx
// Tailwind breakpoints
sm: '640px'   // Tablet
md: '768px'   // Small laptop
lg: '1024px'  // Desktop
xl: '1280px'  // Large desktop
```

### Responsive Grid Example

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* 1 column on mobile, 2 on tablet, 3 on desktop */}
</div>
```

---

## 🎨 Animation & Transitions

### Hover Effects

```tsx
className="transition-colors duration-200 hover:bg-primary-600"
```

### Loading States

```tsx
// src/components/ui/skeleton.tsx
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-neutral-200',
        className
      )}
    />
  );
}

// Usage
<Skeleton className="h-12 w-full" />
```

---

## 🧪 Component Testing

### Example Test (Vitest + Testing Library)

```tsx
// __tests__/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('shows loading spinner when isLoading', () => {
    render(<Button isLoading>Submit</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

---

## 📚 Related Documents

- [Dashboard Specifications](./dashboards.md) - Dashboard-specific components
- [Portfolio Architecture](./portfolio.md) - Public site components
- [Design System](./plan.md) - Overall design principles

---

**Last Updated**: 2025-12-14  
**Version**: 1.0  
**Status**: 🟡 Planning Phase
=======
# UI Components & Design System

## 🎨 Overview

This document defines the **complete UI component library** for VendorConnect. All components follow a **consistent design system** with reusable patterns, accessibility standards (WCAG 2.1 AA), and mobile-first responsive design.

---

## 🏗️ Component Architecture

### Directory Structure

```
src/components/
├── ui/                          ← Base UI primitives (shadcn/ui style)
│   ├── button.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── textarea.tsx
│   ├── card.tsx
│   ├── badge.tsx
│   ├── avatar.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── toast.tsx
│   └── ...
│
├── portfolio/                   ← Public site components
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── HeroSection.tsx
│   ├── FeatureGrid.tsx
│   ├── FeatureCard.tsx
│   ├── PricingCard.tsx
│   ├── Testimonials.tsx
│   ├── CTASection.tsx
│   └── ContactForm.tsx
│
├── dashboards/                  ← Dashboard-specific widgets
│   ├── MetricCard.tsx
│   ├── ChartCard.tsx
│   ├── ActivityFeed.tsx
│   ├── TaskListWidget.tsx
│   ├── AlertsWidget.tsx
│   ├── ProgressBar.tsx
│   ├── StatusBadge.tsx
│   └── QuickActions.tsx
│
├── app/                         ← App shell components
│   ├── AppSidebar.tsx
│   ├── AppTopBar.tsx
│   ├── UserMenu.tsx
│   ├── ProjectSwitcher.tsx
│   └── NotificationBell.tsx
│
├── forms/                       ← Form components
│   ├── LoginForm.tsx
│   ├── ProjectForm.tsx
│   ├── TaskForm.tsx
│   ├── InventoryForm.tsx
│   └── FormField.tsx
│
└── charts/                      ← Data visualization
    ├── LineChart.tsx
    ├── BarChart.tsx
    ├── PieChart.tsx
    ├── AreaChart.tsx
    └── GanttChart.tsx
```

---

## 🎨 Design System Tokens

### Color Palette

```typescript
// src/styles/colors.ts
export const colors = {
  // Primary (Blue - Trust & Professionalism)
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',  // Main brand color
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Secondary (Amber - Construction theme)
  secondary: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',  // Accent color
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  // Success (Green)
  success: {
    50: '#f0fdf4',
    500: '#10b981',
    700: '#047857',
  },
  
  // Warning (Orange)
  warning: {
    50: '#fff7ed',
    500: '#f97316',
    700: '#c2410c',
  },
  
  // Error (Red)
  error: {
    50: '#fef2f2',
    500: '#ef4444',
    700: '#b91c1c',
  },
  
  // Neutral (Grays)
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },
};
```

### Typography Scale

```typescript
// src/styles/typography.ts
export const typography = {
  fontFamily: {
    sans: 'var(--font-geist-sans)',
    mono: 'var(--font-geist-mono)',
  },
  
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
  },
  
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};
```

### Spacing Scale

```typescript
// src/styles/spacing.ts
export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
};
```

### Border Radius

```typescript
export const borderRadius = {
  none: '0',
  sm: '0.25rem',   // 4px
  md: '0.375rem',  // 6px
  lg: '0.5rem',    // 8px
  xl: '0.75rem',   // 12px
  '2xl': '1rem',   // 16px
  full: '9999px',
};
```

### Shadows

```typescript
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
};
```

---

## 🧩 Base UI Components

### Button Component

```tsx
// src/components/ui/button.tsx
import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center rounded-lg font-medium',
          'transition-colors focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none',
          
          // Variants
          {
            'bg-primary-600 text-white hover:bg-primary-700': variant === 'primary',
            'bg-secondary-500 text-white hover:bg-secondary-600': variant === 'secondary',
            'border border-neutral-300 bg-white hover:bg-neutral-50': variant === 'outline',
            'hover:bg-neutral-100': variant === 'ghost',
            'bg-error-600 text-white hover:bg-error-700': variant === 'destructive',
          },
          
          // Sizes
          {
            'h-9 px-3 text-sm': size === 'sm',
            'h-11 px-5 text-base': size === 'md',
            'h-14 px-7 text-lg': size === 'lg',
          },
          
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <LoadingSpinner className="mr-2 h-4 w-4" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

**Usage**:
```tsx
<Button variant="primary" size="md" onClick={handleClick}>
  Save Changes
</Button>

<Button variant="outline" isLoading={loading}>
  Submit
</Button>
```

---

### Input Component

```tsx
// src/components/ui/input.tsx
import { cn } from '@/lib/utils';
import { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, label, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            {label}
            {props.required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            'flex h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2',
            'text-base text-neutral-900 placeholder:text-neutral-400',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-error-500 focus:ring-error-500',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-error-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

**Usage**:
```tsx
<Input
  label="Email Address"
  type="email"
  placeholder="you@example.com"
  error={errors.email}
  required
/>
```

---

### Card Component

```tsx
// src/components/ui/card.tsx
import { cn } from '@/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl border border-neutral-200 bg-white shadow-sm',
          className
        )}
        {...props}
      />
    );
  }
);

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col space-y-1.5 p-6', className)}
        {...props}
      />
    );
  }
);

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn('text-2xl font-semibold leading-none tracking-tight', className)}
        {...props}
      />
    );
  }
);

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
    );
  }
);
```

**Usage**:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Project Summary</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Content goes here...</p>
  </CardContent>
</Card>
```

---

## 📱 Portfolio Components

### Navbar Component

```tsx
// src/components/portfolio/Navbar.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

export function PortfolioNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navLinks = [
    { href: '/features', label: 'Features' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-primary-600" />
          <span className="text-xl font-bold text-neutral-900">VendorConnect</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:items-center md:space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        
        {/* CTA Button */}
        <div className="hidden md:block">
          <Button asChild>
            <Link href="/login">Handle Project</Link>
          </Button>
        </div>
        
        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white">
          <nav className="container mx-auto flex flex-col space-y-4 px-4 py-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-base font-medium text-neutral-600"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Button asChild className="w-full">
              <Link href="/login">Handle Project</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
```

---

### Feature Card Component

```tsx
// src/components/portfolio/FeatureCard.tsx
import { LucideIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
          <Icon className="h-6 w-6 text-primary-600" />
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-neutral-600">{description}</p>
      </CardContent>
    </Card>
  );
}
```

**Usage**:
```tsx
import { Calendar, Warehouse, Users } from 'lucide-react';

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <FeatureCard
    icon={Calendar}
    title="Smart Scheduling"
    description="AI-powered task allocation across vendors and machines"
  />
  <FeatureCard
    icon={Warehouse}
    title="Inventory Tracking"
    description="Real-time stock levels and automatic reorder alerts"
  />
  <FeatureCard
    icon={Users}
    title="Role-Based Access"
    description="6 distinct roles with granular permissions"
  />
</div>
```

---

## 📊 Dashboard Components

### Metric Card Component

```tsx
// src/components/dashboards/MetricCard.tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
}

export function MetricCard({ title, value, change, changeType = 'neutral', icon: Icon }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-neutral-600">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-neutral-400" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-neutral-900">{value}</div>
        {change && (
          <p className={cn(
            'text-xs mt-1',
            {
              'text-success-600': changeType === 'positive',
              'text-error-600': changeType === 'negative',
              'text-neutral-600': changeType === 'neutral',
            }
          )}>
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
```

**Usage**:
```tsx
import { Users, TrendingUp } from 'lucide-react';

<MetricCard
  title="Active Users"
  value={247}
  change="+18 this week"
  changeType="positive"
  icon={Users}
/>
```

---

### Task List Widget

```tsx
// src/components/dashboards/TaskListWidget.tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Task {
  id: string;
  title: string;
  assignee: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  deadline: string;
}

interface TaskListWidgetProps {
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
}

export function TaskListWidget({ tasks, onTaskClick }: TaskListWidgetProps) {
  const statusColors = {
    pending: 'bg-neutral-100 text-neutral-800',
    'in-progress': 'bg-primary-100 text-primary-800',
    completed: 'bg-success-100 text-success-800',
  };
  
  const priorityColors = {
    low: 'bg-neutral-100 text-neutral-800',
    medium: 'bg-warning-100 text-warning-800',
    high: 'bg-error-100 text-error-800',
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-4 rounded-lg border border-neutral-200 hover:border-primary-300 transition-colors cursor-pointer"
              onClick={() => onTaskClick(task.id)}
            >
              <div className="flex-1">
                <h4 className="font-medium text-neutral-900">{task.title}</h4>
                <p className="text-sm text-neutral-600 mt-1">
                  Assigned to: {task.assignee}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={priorityColors[task.priority]}>
                  {task.priority}
                </Badge>
                <Badge className={statusColors[task.status]}>
                  {task.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 📈 Chart Components

### Bar Chart Component (using Recharts)

```tsx
// src/components/charts/BarChart.tsx
'use client';

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BarChartProps {
  data: { name: string; value: number }[];
  color?: string;
}

export function BarChart({ data, color = '#3b82f6' }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsBarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" fill={color} radius={[8, 8, 0, 0]} />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
```

**Usage**:
```tsx
const data = [
  { name: 'Jan', value: 45 },
  { name: 'Feb', value: 60 },
  { name: 'Mar', value: 80 },
];

<BarChart data={data} color="#10b981" />
```

---

## 🔔 App Shell Components

### App Sidebar

```tsx
// src/components/app/AppSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Calendar, Truck, Users, Package, BarChart, Settings } from 'lucide-react';

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export function AppSidebar() {
  const pathname = usePathname();
  
  const links: SidebarLink[] = [
    { href: '/app/proj-123/dashboards/admin', label: 'Dashboard', icon: <Home size={20} /> },
    { href: '/app/proj-123/scheduling', label: 'Scheduling', icon: <Calendar size={20} /> },
    { href: '/app/proj-123/machines', label: 'Machines', icon: <Truck size={20} /> },
    { href: '/app/proj-123/users', label: 'Team', icon: <Users size={20} /> },
    { href: '/app/proj-123/warehouse', label: 'Warehouse', icon: <Package size={20} /> },
    { href: '/app/proj-123/reports', label: 'Reports', icon: <BarChart size={20} /> },
    { href: '/app/proj-123/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];
  
  return (
    <aside className="w-64 border-r border-neutral-200 bg-white">
      <div className="p-6">
        <h2 className="text-lg font-bold text-neutral-900">VendorConnect</h2>
      </div>
      <nav className="space-y-1 px-3">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              )}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

---

## ♿ Accessibility Guidelines

### ARIA Labels

```tsx
// Always include aria-label for icon-only buttons
<button aria-label="Close dialog">
  <X />
</button>

// Use aria-describedby for error messages
<input
  id="email"
  aria-describedby="email-error"
  aria-invalid={!!error}
/>
{error && <span id="email-error" role="alert">{error}</span>}
```

### Keyboard Navigation

All interactive components support:
- **Tab**: Navigate forward
- **Shift+Tab**: Navigate backward
- **Enter/Space**: Activate buttons
- **Escape**: Close modals/dropdowns

### Focus Management

```tsx
// Trap focus inside modals
import { Dialog } from '@headlessui/react';

<Dialog onClose={handleClose}>
  <Dialog.Panel>
    {/* Focus is automatically trapped */}
  </Dialog.Panel>
</Dialog>
```

---

## 📱 Responsive Design Patterns

### Mobile-First Breakpoints

```tsx
// Tailwind breakpoints
sm: '640px'   // Tablet
md: '768px'   // Small laptop
lg: '1024px'  // Desktop
xl: '1280px'  // Large desktop
```

### Responsive Grid Example

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* 1 column on mobile, 2 on tablet, 3 on desktop */}
</div>
```

---

## 🎨 Animation & Transitions

### Hover Effects

```tsx
className="transition-colors duration-200 hover:bg-primary-600"
```

### Loading States

```tsx
// src/components/ui/skeleton.tsx
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-neutral-200',
        className
      )}
    />
  );
}

// Usage
<Skeleton className="h-12 w-full" />
```

---

## 🧪 Component Testing

### Example Test (Vitest + Testing Library)

```tsx
// __tests__/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('shows loading spinner when isLoading', () => {
    render(<Button isLoading>Submit</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

---

## 📚 Related Documents

- [Dashboard Specifications](./dashboards.md) - Dashboard-specific components
- [Portfolio Architecture](./portfolio.md) - Public site components
- [Design System](./plan.md) - Overall design principles

---

**Last Updated**: 2025-12-14  
**Version**: 1.0  
**Status**: 🟡 Planning Phase
>>>>>>> 1e7c767fd985a8b365fdb5ec78cc5cecdee02c84
