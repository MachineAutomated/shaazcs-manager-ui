import '../App.css'
import { useEffect, useState } from "react";
import banner_icon from '../assets/react.svg';
import { Menubar } from 'primereact/menubar';
import { Image } from 'primereact/image';
import { Button } from 'primereact/button';
import { confirmDialog } from 'primereact/confirmdialog';
import { ConfirmDialog } from 'primereact/confirmdialog';
        

export default function TopBar() {

    const [isScrolled, setIsScrolled] = useState(false);

    const handleLogout = () => {
        confirmDialog({
          message: 'Are you sure you want to logout?',
          header: 'Confirm Logout',
          icon: 'pi pi-exclamation-triangle',
          acceptClassName: 'p-button-danger',
          accept: () => {
            // perform logout
            sessionStorage.removeItem('jwt');
            // redirect after logout (or use history.push if using react-router)
            window.location.href = '/';
          },
          reject: () => {
            // optional: do nothing
          }
        });
      };

    useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

    const start = <div className='topbar-start'><Image alt="logo" src={banner_icon} height="25" /> </div>//<Divider layout="vertical" className='topbar-start-divider'/></div>

    const end = (
        <div className="flex align-items-center gap-2">
            <Button 
                icon="pi pi-sign-out"
                className="p-button-text p-button-plain logout-btn"
                aria-label="Logout"
                onClick={handleLogout}
            />
        </div>
    );

    return (
        <div className={`topbar-container ${isScrolled ? "scrolled" : ""}`}> 
             <ConfirmDialog />
            <Menubar start={start} end={end} className='topbar-menu'/>
        </div>
    );
}