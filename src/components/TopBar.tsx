import '../App.css'
import { useEffect, useState } from "react";
import banner_icon from '../assets/react.svg';
import brand_icon from '../assets/react.svg';
import { Menubar } from 'primereact/menubar';
import { Avatar } from 'primereact/avatar';
import { Image } from 'primereact/image';
// import { Divider } from 'primereact/divider';
        

export default function TopBar() {

    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

    const start = <div className='topbar-start'><Image alt="logo" src={banner_icon} height="25" /> </div>//<Divider layout="vertical" className='topbar-start-divider'/></div>

    const end = (
        <div className="flex align-items-center gap-2">
            <Avatar image={brand_icon} shape="circle" />
        </div>
    );

    return (
        <div className={`topbar-container ${isScrolled ? "scrolled" : ""}`}> 
            <Menubar start={start} end={end} className='topbar-menu'/>
        </div>
    );
}