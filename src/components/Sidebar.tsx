import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import {
  HomeIcon,
  TrophyIcon,
  GiftIcon,
  UsersIcon,
  IdentificationIcon,
  ArrowUpOnSquareIcon,
} from '@heroicons/react/24/outline';

const navLinks = [
  { name: 'Dashboard', href: '/', icon: HomeIcon, roles: ['SUPERADMIN', 'ADMIN', 'SENIORUSER', 'WINNERREPORTS', 'ALLREPORTS'] },
  { name: 'Draw Management', href: '/draws', icon: TrophyIcon, roles: ['SUPERADMIN', 'ADMIN'] },
  { name: 'Upload CSV for Draw', href: '/csv-upload', icon: ArrowUpOnSquareIcon, roles: ['SUPERADMIN', 'ADMIN'] },
  { name: 'Prize Structures', href: '/prizes', icon: GiftIcon, roles: ['SUPERADMIN', 'ADMIN'] },
  { name: 'Winners List', href: '/winners', icon: IdentificationIcon, roles: ['SUPERADMIN', 'ADMIN', 'SENIORUSER', 'WINNERREPORTS', 'ALLREPORTS'] },
  { name: 'User Management', href: '/users', icon: UsersIcon, roles: ['SUPERADMIN'] },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Sidebar() {
    const { user } = useAuth();
    
    return (
        <div className="hidden md:flex md:flex-shrink-0">
            <div className="flex flex-col w-64">
                <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900 text-white">
                    <span className="text-2xl font-bold">PromoAdmin</span>
                </div>
                <div className="flex-1 flex flex-col overflow-y-auto bg-gray-800">
                    <nav className="flex-1 px-2 py-4 space-y-1">
                        {navLinks.map((item) =>
                            user && item.roles.includes(user.role) && (
                                <NavLink
                                    key={item.name}
                                    to={item.href}
                                    end={item.href === '/'}
                                    className={({ isActive }) =>
                                        classNames(
                                            'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                                            isActive
                                                ? 'bg-gray-900 text-white'
                                                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                        )
                                    }
                                >
                                    <item.icon className="mr-3 flex-shrink-0 h-6 w-6" />
                                    {item.name}
                                </NavLink>
                            )
                        )}
                    </nav>
                </div>
            </div>
        </div>
    );
}