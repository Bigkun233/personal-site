// src/components/Layout.tsx — 杂志风外壳（全站统一）
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { site } from '../data/site'
import { Icon } from './Icon'
import { ThemeToggle } from './ThemeToggle'

function NavItem({ to, label, onClick }: { to: string; label: string; onClick?: () => void }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      end={to === '/'}
      className={({ isActive }) =>
        `link-underline py-1 text-[0.93rem] transition-colors ${
          isActive
            ? 'text-brand-600 dark:text-brand-400 [text-decoration-color:currentColor]'
            : 'text-ink-soft hover:text-ink dark:text-night-soft dark:hover:text-night-ink'
        }`
      }
    >
      {label}
    </NavLink>
  )
}

export function Layout() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="site-header sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md dark:border-night-line dark:bg-night/85">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5">
          <Link to="/" className="group flex items-baseline gap-2">
            <span className="font-display text-xl font-semibold text-ink dark:text-night-ink">
              {site.name}
            </span>
            <span className="hidden text-xs tracking-wide text-ink-faint sm:inline dark:text-night-soft">
              {site.tagline}
            </span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {site.nav.map((item) => (
              <NavItem key={item.path} to={item.path} label={item.label} />
            ))}
            <span className="h-4 w-px bg-line dark:bg-night-line" />
            <ThemeToggle />
          </nav>

          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label="打开菜单"
              className="grid h-9 w-9 place-items-center text-xl text-ink-soft dark:text-night-soft"
            >
              <Icon name={open ? 'close' : 'menu'} />
            </button>
          </div>
        </div>

        {open && (
          <nav className="border-t border-line bg-paper px-5 py-3 md:hidden dark:border-night-line dark:bg-night">
            <div className="flex flex-col gap-3">
              {site.nav.map((item) => (
                <NavItem key={item.path} to={item.path} label={item.label} onClick={() => setOpen(false)} />
              ))}
            </div>
          </nav>
        )}
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-20 pt-14">
        <Outlet />
      </main>

      <footer className="border-t border-line dark:border-night-line">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-5 py-8 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between dark:text-night-soft">
          <p className="font-display">
            © {new Date().getFullYear()} {site.name}
            <span className="ml-2 font-sans text-xs text-ink-faint dark:text-night-soft">
              {site.location}
            </span>
          </p>
          <div className="flex items-center gap-5">
            {site.socials.map((s) => (
              <a
                key={s.label}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="link-underline transition-colors hover:text-brand-600 dark:hover:text-brand-400"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
