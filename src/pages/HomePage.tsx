import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { ArrowRightIcon, TrophyIcon, GiftIcon, UsersIcon, IdentificationIcon, ArrowUpOnSquareIcon } from '@heroicons/react/24/outline';

const actions = [
  { title: 'Draw Management', href: '/draws', icon: TrophyIcon, description: 'Execute a draw using the live data feed.', roles: ['SUPERADMIN', 'ADMIN'] },
  { title: 'Upload CSV for Draw', href: '/csv-upload', icon: ArrowUpOnSquareIcon, description: 'Manually run a draw by uploading a CSV file.', roles: ['SUPERADMIN', 'ADMIN'] },
  { title: 'Manage Prizes', href: '/prizes', icon: GiftIcon, description: 'Create and edit prize structures.', roles: ['SUPERADMIN', 'ADMIN'] },
  { title: 'View Winners', href: '/winners', icon: IdentificationIcon, description: 'See the results from all past draws.', roles: ['SUPERADMIN', 'ADMIN', 'SENIORUSER'] },
  { title: 'Manage Users', href: '/users', icon: UsersIcon, description: 'Add or remove administrator accounts.', roles: ['SUPERADMIN'] },
];

export default function HomePage() {
  const { user } = useAuth();
  return (
    <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.username}!</h1>
        <p className="mt-2 text-lg text-gray-600">Select an action to get started.</p>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {actions.map((action) => (
                user && action.roles.includes(user.role) && (
                    <Link key={action.title} to={action.href} className="relative group overflow-hidden rounded-lg bg-white p-6 shadow hover:shadow-lg transition-shadow duration-300">
                        <div><span className="rounded-lg inline-flex p-3 bg-indigo-50 text-indigo-700 ring-4 ring-white"><action.icon className="h-6 w-6" aria-hidden="true" /></span></div>
                        <div className="mt-8"><h3 className="text-lg font-medium text-gray-900"><span className="absolute inset-0" aria-hidden="true" />{action.title}</h3><p className="mt-2 text-sm text-gray-500">{action.description}</p></div>
                        <span className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400" aria-hidden="true"><ArrowRightIcon className="h-6 w-6" /></span>
                    </Link>
                )
            ))}
        </div>
    </div>
  );
}