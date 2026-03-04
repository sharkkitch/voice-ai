import { cn } from '@/utils';
import { FC, HTMLAttributes } from 'react';
import { NavLink } from 'react-router-dom';

interface TabProps extends HTMLAttributes<HTMLDivElement> {
  isActive?: boolean;
}

interface LinkTabProps extends TabProps {
  to: string;
}

export const Tab: FC<TabProps> = ({ isActive, children, ...props }) => {
  return (
    <div
      {...props}
      className={cn(
        'relative flex items-center px-4 cursor-pointer text-xs font-medium uppercase tracking-[0.08em] whitespace-nowrap transition-colors h-10',
        isActive
          ? 'text-gray-900 dark:text-gray-100 after:absolute after:bottom-0 after:inset-x-0 after:h-0.5 after:bg-primary'
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100',
        props.className,
      )}
    >
      {children}
    </div>
  );
};

export const TabLink: FC<LinkTabProps> = ({ to, children, className }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => {
        return cn(
          'relative flex items-center gap-2 px-4 cursor-pointer text-xs font-medium uppercase tracking-[0.08em] whitespace-nowrap transition-colors h-10',
          isActive
            ? 'text-gray-900 dark:text-gray-100 after:absolute after:bottom-0 after:inset-x-0 after:h-0.5 after:bg-primary'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100',
          className,
        );
      }}
    >
      {children}
    </NavLink>
  );
};
export const SideTabLink: FC<LinkTabProps> = props => {
  return (
    <NavLink
      to={props.to}
      className={({ isActive }) =>
        cn(
          'group px-2 border-r-[3px] border-transparent -ms-[0.1rem] cursor-pointer font-medium text-sm/6 whitespace-nowrap tracking-wide text-pretty',
          'flex items-center px-5 py-2 relative',
          isActive
            ? 'text-blue-500 bg-blue-500/10'
            : 'hover:bg-blue-500/5 hover:text-blue-500',
          props.className,
        )
      }
    >
      {props.children}
    </NavLink>
  );
};

export const SideTab: FC<LinkTabProps> = props => {
  return (
    <div
      onClick={props.onClick}
      className={cn(
        'cursor-pointer border-l-2 transition-colors',
        'flex items-center h-8 px-4 text-sm font-medium whitespace-nowrap',
        props.isActive === true
          ? 'border-l-primary text-primary bg-primary/10'
          : 'border-l-transparent text-gray-600 dark:text-gray-400 hover:bg-primary/5 hover:text-primary',
        props.className,
      )}
    >
      {props.children}
    </div>
  );
};
