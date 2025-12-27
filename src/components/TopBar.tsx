// TopBar.tsx
import { useEffect, useRef, useState } from 'react';
import banner_icon from '../assets/react.svg';
import { Menubar } from 'primereact/menubar';
import { Image } from 'primereact/image';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';
import { confirmDialog } from 'primereact/confirmdialog';
import { ConfirmDialog } from 'primereact/confirmdialog';
import type { MenuItem } from 'primereact/menuitem';
import api from '../api/api';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { OverlayPanel } from 'primereact/overlaypanel';

export default function TopBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const menu = useRef<Menu | null>(null);
  const countdownOverlay = useRef<OverlayPanel | null>(null);

  // JWT countdown state
  const [remainingMs, setRemainingMs] = useState(0);
  const [showCountdown, setShowCountdown] = useState(false);
  const [promptVisible, setPromptVisible] = useState(false);
  const [promptForced, setPromptForced] = useState(false);

  const mmss = (ms: number) => {
    const s = Math.max(0, Math.floor(ms / 1000));
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const SHOW_MS = 5 * 60 * 1000;   // show timer in top bar when <= 5m
    const PROMPT_MS = 2 * 60 * 1000; // show dialog when <= 2m

    const tick = () => {
      const expIso = sessionStorage.getItem('jwtExpiresAt');
      if (!expIso) {
        setRemainingMs(0);
        setShowCountdown(false);
        setPromptVisible(false);
        return;
      }
      const exp = new Date(expIso).getTime();
      const rem = exp - Date.now();
      // debug: help verify countdown visibility
      if (import.meta.env.DEV) {
        console.debug('[TopBar] JWT remaining (ms):', rem);
      }

      if (rem <= 0) {
        // expired -> clear and redirect
        sessionStorage.removeItem('jwt');
        sessionStorage.removeItem('jwtExpiresAt');
        window.location.href = '/';
        return;
      }

      setRemainingMs(rem);
      setShowCountdown(rem <= SHOW_MS);
      setPromptVisible(promptForced || rem <= PROMPT_MS);
    };

    // start ticking
    tick();
    const iv = window.setInterval(tick, 1000);

    // when login refreshes/starts a new session
    const onJwtStart = () => tick();
    window.addEventListener('jwt-start', onJwtStart);

    return () => {
      window.clearInterval(iv);
      window.removeEventListener('jwt-start', onJwtStart);
    };
  }, [promptForced]);

  const handleExtendSession = async () => {
    try {
      // Adjust endpoint as per your backend
      const res = await api.post('/refreshLogin');
      const token = res?.data?.token;
      const expiresAt =
        res?.data?.expiresAt ?? new Date(Date.now() + 360000).toISOString();
      if (!token) throw new Error('No token');

      sessionStorage.setItem('jwt', token);
      sessionStorage.setItem('jwtExpiresAt', expiresAt);
      setPromptVisible(false);
      setPromptForced(false);
      // notify listeners
      window.dispatchEvent(new CustomEvent('jwt-start', { detail: { expiresAt } }));
    } catch {
      sessionStorage.removeItem('jwt');
      sessionStorage.removeItem('jwtExpiresAt');
      setPromptForced(false);
      window.location.href = '/';
    }
  };

  // Handlers (replace stubs with real logic)
  const handleProfileUpdate = () => {
    // open profile modal or navigate to profile page
    console.log('Profile update clicked');
    // example: navigate('/profile');
  };

  const handleDeleteUser = () => {
    confirmDialog({
      message: 'Are you sure you want to delete your user account? This action cannot be undone.',
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        // perform delete user API call here
        try {
          const response = await api.delete(`/offboard/${sessionStorage.getItem('username')}`);
          if(response.status !== 200) {
            throw new Error("Delete user failed");
          }
          console.log(`User ${sessionStorage.getItem('username')} deleted successfully.`);
        } catch (err) {
          console.error("Delete user failed:", err);
        }
        // After deletion, redirect or clear session:
        sessionStorage.removeItem('jwt');
        sessionStorage.removeItem('username');
        window.location.href = '/';
      },
      reject: () => {
        /* nothing */
      }
    });
  };

  const handleLogoutConfirmed = () => {
    sessionStorage.removeItem('jwt');
    window.location.href = '/';
  };

  const handleLogout = () => {
    confirmDialog({
      message: 'Are you sure you want to logout?',
      header: 'Confirm Logout',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: handleLogoutConfirmed,
      reject: () => {}
    });
  };

  // Menu items for user menu
  const items: MenuItem[] = [
    {
      label: 'Profile Update',
      icon: 'pi pi-user-edit',
      command: () => {
        handleProfileUpdate();
      }
    },
    {
      label: 'Delete User',
      icon: 'pi pi-trash',
      command: () => {
        handleDeleteUser();
      }
    },
    { separator: true },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => {
        handleLogout();
      }
    }
  ];

  const start = (
    <div className="topbar-start">
      <Image alt="logo" src={banner_icon} height="25" />
    </div>
  );

  // End: user icon that toggles popup menu
  const end = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
      {/* Countdown visible only in last 5 minutes */}
      {showCountdown && (
        <Tag
          severity="warning"
          icon="pi pi-clock"
          value={mmss(remainingMs)}
          rounded
          className="mr-2 countdown-tag"
          style={{ alignSelf: 'center', cursor: 'pointer' }}
          onClick={() => { setPromptForced(true); setPromptVisible(true); }}
          onMouseEnter={(e) => countdownOverlay.current?.show(e, e.currentTarget as HTMLElement)}
          onMouseLeave={() => countdownOverlay.current?.hide()}
        />
      )}

      {/* Menu component (popup); model provided below */}
      <Menu model={items} popup ref={menu} />

      {/* User icon button toggles the menu popup */}
      <Button
        icon="pi pi-user"
        className="p-button-text p-button-plain user-menu-btn"
        aria-label="User menu"
        onClick={(e) => menu.current && menu.current.toggle(e)}
      />
    </div>
  );

  return (
    <div className={`topbar-container ${isScrolled ? 'scrolled' : ''}`}>
      {/* ConfirmDialog used by menu actions */}
      <ConfirmDialog />

      {/* Hover overlay for countdown tag */}
      <OverlayPanel ref={countdownOverlay} showCloseIcon dismissable appendTo={document.body} style={{ zIndex: 2000 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="pi pi-clock" />
          <span>Extend Session</span>
        </div>
      </OverlayPanel>

      {/* Session-expiring dialog (shows at T-2m) */}
      <Dialog
        visible={promptVisible}
        header="Session Expiring"
        onHide={() => { setPromptForced(false); setPromptVisible(false); }}
        style={{ width: '26rem' }}
      >
        <p>
          Jwt will expire in {mmss(remainingMs)}. Click yes if you want to continue
          with the session or you will be redirected to the login page.
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Button
            label="No"
            className="p-button-outlined p-button-danger"
            onClick={handleLogoutConfirmed}
          />
          <Button label="Yes" icon="pi pi-refresh" onClick={handleExtendSession} />
        </div>
      </Dialog>

      <Menubar start={start} end={end} className="topbar-menu" />
    </div>
  );
}
