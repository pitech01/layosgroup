import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useState } from 'react';

const StudentLayout = () => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="student-layout">
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <div className="main-content-wrapper">
                <Topbar collapsed={collapsed} setCollapsed={setCollapsed} />
                <main className="dashboard-scroll-area">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default StudentLayout;
