import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useChatHistory } from '../lib/hooks/useChatHistory';
import { useClickOutside } from '../lib/hooks/useClickOutside';
import { useToast } from '../lib/hooks/useToast';
import { useAuthStore } from '../lib/stores/authStore';
import { Icon, type IconName } from './Icon';
import { DropdownMenu, type DropdownItem, IconButton, Wordmark } from './primitives';
import { useTheme } from './Theme';

type ItemId = 'new' | 'home' | 'search' | 'discover' | 'history' | 'spaces';

interface NavItem {
  id: ItemId;
  label: string;
  icon: IconName;
  href?: string;
  accent?: boolean;
  disabled?: boolean;
}

const NAV: NavItem[][] = [
  [{ id: 'new', label: 'New thread', icon: 'plus', accent: true, href: '/' }],
  [
    { id: 'home', label: 'Home', icon: 'home', href: '/' },
    { id: 'search', label: 'Search', icon: 'search', disabled: true },
    { id: 'discover', label: 'Discover', icon: 'compass', disabled: true },
    { id: 'history', label: 'History', icon: 'clock', href: '/history' },
    { id: 'spaces', label: 'Translation Spaces', icon: 'languages', disabled: true },
  ],
];

const COLLAPSE_KEY = 'th-sidebar-collapsed';

interface SidebarProps {
  user?: { name: string; plan: string };
  isAdmin?: boolean;
  mobile?: boolean;
  open?: boolean;
  onClose?: () => void;
}

function userInfoFromAuth(
  authUser: ReturnType<typeof useAuthStore.getState>['user'],
  isAdmin: boolean,
): { name: string; plan: string } {
  if (!authUser) return { name: 'Guest', plan: 'Translation Helper' };
  const name = authUser.display_name || authUser.email.split('@')[0] || 'You';
  const plan = isAdmin ? 'Platform admin' : 'Translation Helper';
  return { name, plan };
}

export function Sidebar({
  user,
  isAdmin,
  mobile = false,
  open = false,
  onClose,
}: SidebarProps) {
  const authUser = useAuthStore((s) => s.user);
  const resolvedIsAdmin = isAdmin ?? authUser?.is_platform_admin ?? false;
  const resolvedUser = user ?? userInfoFromAuth(authUser, resolvedIsAdmin);
  if (mobile) {
    if (!open) return null;
    return (
      <SidebarDrawer
        user={resolvedUser}
        isAdmin={resolvedIsAdmin}
        onClose={onClose ?? (() => {})}
      />
    );
  }
  return <SidebarInline user={resolvedUser} isAdmin={resolvedIsAdmin} />;
}

function SidebarDrawer({
  user,
  isAdmin,
  onClose,
}: {
  user: { name: string; plan: string };
  isAdmin: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <>
      <div
        className="tw-drawer-backdrop"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'var(--overlay)',
          zIndex: 40,
          backdropFilter: 'blur(2px)',
        }}
      />
      <div
        className="tw-drawer-panel"
        style={{
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          width: 'min(288px, 86vw)',
          background: 'var(--surface)',
          borderRight: '1px solid var(--border-faint)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <SidebarBody
          user={user}
          isAdmin={isAdmin}
          collapsed={false}
          onCollapseToggle={onClose}
          collapseIcon="x"
          onItemNavigated={onClose}
        />
      </div>
    </>
  );
}

function SidebarInline({
  user,
  isAdmin,
}: {
  user: { name: string; plan: string };
  isAdmin: boolean;
}) {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(COLLAPSE_KEY) === '1';
  });

  useEffect(() => {
    window.localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0');
  }, [collapsed]);

  const width = collapsed ? 64 : 240;

  return (
    <aside
      style={{
        width,
        flex: `0 0 ${width}px`,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border-faint)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        transition: 'width 180ms ease-out, flex-basis 180ms ease-out',
      }}
    >
      <SidebarBody
        user={user}
        isAdmin={isAdmin}
        collapsed={collapsed}
        onCollapseToggle={() => setCollapsed((v) => !v)}
        collapseIcon="panel-left"
      />
    </aside>
  );
}

interface SidebarBodyProps {
  user: { name: string; plan: string };
  isAdmin: boolean;
  collapsed: boolean;
  onCollapseToggle: () => void;
  collapseIcon: IconName;
  onItemNavigated?: () => void;
}

function SidebarBody({
  user,
  isAdmin,
  collapsed,
  onCollapseToggle,
  collapseIcon,
  onItemNavigated,
}: SidebarBodyProps) {
  const [location, navigate] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { mode, toggle } = useTheme();
  const toast = useToast();
  const logout = useAuthStore((s) => s.logout);

  useClickOutside(menuRef, () => setMenuOpen(false), menuOpen);

  const isActive = (id: ItemId, href?: string) => {
    if (id === 'home') return location === '/';
    if (id === 'history') return location === '/history';
    return href ? location === href : false;
  };

  const onNavClick = (item: NavItem) => {
    if (item.disabled) return;
    if (item.href) {
      onItemNavigated?.();
      return;
    }
    toast.show({ title: `${item.label} — coming soon` });
  };

  const goAndClose = (to: string) => {
    navigate(to);
    onItemNavigated?.();
  };

  const userMenu: DropdownItem[] = [
    { label: 'Profile', icon: 'user', onSelect: () => goAndClose('/profile') },
    { label: 'Settings', icon: 'settings', onSelect: () => goAndClose('/settings') },
    { divider: true },
    {
      label: `Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`,
      icon: 'sparkles',
      onSelect: toggle,
    },
    ...(isAdmin
      ? ([
          { divider: true },
          { section: 'Admin' },
          { label: 'Agent Prompts', icon: 'sliders', onSelect: () => goAndClose('/admin/prompts') },
        ] satisfies DropdownItem[])
      : []),
    { divider: true },
    {
      label: 'Log out',
      icon: 'log-out',
      destructive: true,
      onSelect: () => {
        void logout();
        toast.show({ title: 'Signed out' });
        goAndClose('/login');
      },
    },
  ];

  return (
    <>
      <div
        style={{
          padding: collapsed ? '20px 12px 24px' : '20px 20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}
      >
        {!collapsed && (
          <>
            <Wordmark size={18} />
            <div style={{ flex: 1 }} />
          </>
        )}
        <IconButton
          icon={collapseIcon}
          size={28}
          iconSize={15}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={onCollapseToggle}
        />
      </div>

      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: collapsed ? '0 8px' : '0 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        {NAV.map((section, si) => (
          <div key={si} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {section.map((it) => (
              <SidebarLink
                key={it.id}
                item={it}
                active={isActive(it.id, it.href)}
                collapsed={collapsed}
                onClick={() => onNavClick(it)}
              />
            ))}
          </div>
        ))}

        {!collapsed && <RecentChats activeLocation={location} onNavigated={onItemNavigated} />}
      </div>

      <div
        style={{ padding: 12, borderTop: '1px solid var(--border-faint)', position: 'relative' }}
        ref={menuRef}
      >
        <button
          onClick={() => setMenuOpen((v) => !v)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: collapsed ? 6 : '8px 10px',
            borderRadius: 14,
            background: 'var(--paper)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-xs)',
            width: '100%',
            textAlign: 'left',
            cursor: 'pointer',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
          aria-label="Open user menu"
        >
          <UserBadge name={user.name} />
          {!collapsed && (
            <>
              <div style={{ flex: 1, minWidth: 0, lineHeight: 1.2 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                  {user.name.split(' ')[0]}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3 }}>
                  {user.plan}
                </div>
              </div>
              <Icon name="more-horizontal" size={15} style={{ color: 'var(--text-3)' }} />
            </>
          )}
        </button>
        {menuOpen && (
          <div
            style={{
              position: 'absolute',
              bottom: 76,
              left: 12,
              right: collapsed ? 'auto' : 12,
              zIndex: 10,
              minWidth: 220,
            }}
          >
            <DropdownMenu items={userMenu} width={collapsed ? 220 : '100%'} />
          </div>
        )}
      </div>
    </>
  );
}

function UserBadge({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('');
  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        background: 'var(--accent)',
        color: 'var(--on-accent)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        fontSize: 13,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)',
        flex: '0 0 auto',
      }}
    >
      {initials}
    </div>
  );
}

function RecentChats({
  activeLocation,
  onNavigated,
}: {
  activeLocation: string;
  onNavigated?: () => void;
}) {
  const { chats } = useChatHistory();
  const recent = chats
    .slice(0, 4)
    .map((c) => ({ id: c.id, title: c.title || 'Untitled chat' }));
  if (recent.length === 0) return null;
  return (
    <div style={{ marginTop: 'auto' }}>
      <div className="tw-eyebrow" style={{ padding: '8px 14px 6px' }}>
        Recent
      </div>
      {recent.map((c) => {
        const active = activeLocation === `/chat/${c.id}`;
        return (
          <Link
            key={c.id}
            href={`/chat/${c.id}`}
            onClick={onNavigated}
            style={{
              height: 36,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '0 14px',
              borderRadius: 10,
              color: active ? 'var(--text)' : 'var(--text-2)',
              fontSize: 13,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              background: active ? 'var(--surface-2)' : 'transparent',
              fontWeight: active ? 500 : 400,
              position: 'relative',
            }}
          >
            {active && (
              <span
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 8,
                  bottom: 8,
                  width: 2,
                  borderRadius: 999,
                  background: 'var(--accent)',
                }}
              />
            )}
            {c.title}
          </Link>
        );
      })}
    </div>
  );
}

interface SidebarLinkProps {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}

function SidebarLink({ item, active, collapsed, onClick }: SidebarLinkProps) {
  const disabled = item.disabled === true;
  const cursor = disabled ? 'not-allowed' : 'pointer';

  const body: ReactNode = item.accent ? (
    <span
      style={{
        height: collapsed ? 40 : 44,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap: 12,
        padding: collapsed ? 0 : '0 14px',
        borderRadius: 12,
        background: 'var(--paper)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-xs)',
        fontSize: 14,
        fontWeight: 500,
        color: 'var(--text)',
        cursor,
      }}
      title={collapsed ? item.label : undefined}
    >
      <span
        style={{
          width: 24,
          height: 24,
          borderRadius: 999,
          background: 'var(--accent-soft)',
          color: 'var(--accent)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: '0 0 auto',
        }}
      >
        <Icon name={item.icon} size={13} strokeWidth={2.2} />
      </span>
      {!collapsed && item.label}
    </span>
  ) : (
    <span
      style={{
        height: 44,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        gap: 12,
        padding: collapsed ? 0 : '0 14px',
        borderRadius: 12,
        background: active ? 'var(--surface-2)' : 'transparent',
        color: active ? 'var(--text)' : 'var(--text-2)',
        fontSize: 14,
        fontWeight: active ? 500 : 400,
        cursor,
        opacity: disabled ? 0.4 : 1,
      }}
      title={collapsed ? `${item.label}${disabled ? ' — coming soon' : ''}` : disabled ? 'Coming soon' : undefined}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
        <Icon name={item.icon} size={18} strokeWidth={1.7} />
        {!collapsed && item.label}
      </span>
      {!collapsed && disabled && (
        <span
          style={{
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'var(--text-3)',
            padding: '2px 7px',
            borderRadius: 999,
            background: 'var(--surface-2)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          Soon
        </span>
      )}
    </span>
  );

  if (item.href) {
    return (
      <Link href={item.href} onClick={onClick} style={{ textDecoration: 'none' }}>
        {body}
      </Link>
    );
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        background: 'transparent',
        border: 0,
        padding: 0,
        width: '100%',
        cursor,
      }}
    >
      {body}
    </button>
  );
}
