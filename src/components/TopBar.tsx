// TopBar.tsx
import '../App.css';
import React, { useEffect, useRef, useState } from 'react';
import banner_icon from '../assets/react.svg';
import { Menubar } from 'primereact/menubar';
import { Image } from 'primereact/image';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';
import { confirmDialog } from 'primereact/confirmdialog';
import { ConfirmDialog } from 'primereact/confirmdialog';
import type { MenuItem } from 'primereact/menu';

export default function TopBar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const menu = useRef<Menu | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      accept: () => {
        // perform delete user API call here
        console.log('User deleted (stub)');
        // After deletion, redirect or clear session:
        sessionStorage.removeItem('jwt');
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
    <div className="flex align-items-center gap-2">
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

      <Menubar start={start} end={end} className="topbar-menu" />
    </div>
  );
}
