import React, { Fragment } from 'react';
import { useAuth } from '@contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, UserCircleIcon } from '@heroicons/react/20/solid';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="relative bg-white shadow-sm z-10">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-end h-16">
          <div className="flex items-center">
            {user && (
              <Menu as="div" className="ml-3 relative">
                <div>
                  <Menu.Button className="max-w-xs bg-white rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 p-1">
                    <span className="sr-only">Open user menu</span>
                    <UserCircleIcon className="h-8 w-8 text-gray-500" />
                    <span className="hidden md:block mx-2 text-gray-700 font-medium">
                      {user.username}
                    </span>
                    <ChevronDownIcon className="hidden md:block h-5 w-5 text-gray-500" />
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm">Signed in as</p>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.username}
                      </p>
                      <p className="text-xs text-gray-500">{user.role}</p>
                    </div>
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={classNames(
                              active ? 'bg-gray-100' : '',
                              'block w-full text-left px-4 py-2 text-sm text-gray-700'
                            )}
                          >
                            Sign out
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}