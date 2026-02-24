import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from '../../../components/layout/Topbar';

const StudentLayout = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="student-layout">
            <Sidebar collapsed={sidebarCollapsed} />

            <div className="main-content-wrapper">
                <Topbar
                    role="student"
                    collapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                />

                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default StudentLayout;
