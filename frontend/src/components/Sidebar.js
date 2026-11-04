import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Stethoscope, BookOpen, Tractor, TrendingUp, Calculator, BarChart2, Leaf } from 'lucide-react';
import '../styles/sidebar.css';

export default function Sidebar() {
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Get Recommendation', path: '/triage', icon: <Stethoscope size={20} />, childPaths: ['/lab', '/plan-summary'] },
        { name: 'My Plans', path: '/my-plans', icon: <BookOpen size={20} /> },
        { name: 'Farm Portfolio', path: '/farms', icon: <Tractor size={20} /> },
        { name: 'Savings Analytics', path: '/analytics', icon: <TrendingUp size={20} /> },
        { name: 'ROI Calculator', path: '/calculator', icon: <Calculator size={20} /> },
        { name: 'Impact Visualizer', path: '/impact', icon: <BarChart2 size={20} /> },
    ];

    return (
        <aside className="global-sidebar">
            <div className="sidebar-header">
                <Leaf size={28} color="#10b981" />
                <h2>Organic Buddy</h2>
            </div>
            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`nav-item ${
                            location.pathname === item.path ||
                            (item.childPaths || []).includes(location.pathname) ||
                            (item.path !== '/dashboard' && !['/farms', '/my-plans'].includes(item.path) && location.pathname.startsWith(item.path)) ||
                            (location.pathname === '/plan-summary' && location.state?.from === item.path) ||
                            (location.pathname.startsWith('/farms/') && item.path === '/farms')
                                ? 'active'
                                : ''
                        }`}
                    >
                        {item.icon}
                        <span>{item.name}</span>
                    </Link>
                ))}
            </nav>
        </aside>
    );
}
