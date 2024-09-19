"use client";
import Link from "next/link";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { AlignJustify, Moon, Bell } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { useState, useEffect, useRef } from "react";
import { fetchNotificationsForUser, markNotificationsAsRead } from "@/actions";

function Header({ user, profileInfo }) {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

 
  const handleNotificationClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  
const handleMarkAllAsRead = async () => {
  try {
    await markNotificationsAsRead(user.id); 
    
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) => ({
        ...notification,
        read: true, 
      }))
    );

    setUnreadCount(0); 
  } catch (error) {
    console.error("Error marking notifications as read:", error);
  }
};


  useEffect(() => {
    async function loadNotifications() {
      if (user) {
        try {
          const notificationsData = await fetchNotificationsForUser(user.id);
          setNotifications(notificationsData);
          setUnreadCount(notificationsData.filter((n) => !n.read).length);
        } catch (error) {
          console.error("Error fetching notifications:", error);
        }
      }
    }

    loadNotifications();
  }, [user]);

  const menuItems = [
    { label: "Home", path: "/", show: true },
    { label: "Feed", path: "/feed", show: profileInfo },
    { label: "Login", path: "/sign-in", show: !user },
    { label: "Register", path: "/sign-up", show: !user },
    {
      label: "Activity",
      path: "/activity",
      show: profileInfo?.role === "candidate",
    },
    {
      label: "Companies",
      path: "/companies",
      show: profileInfo?.role === "candidate",
    },
    { label: "Jobs", path: "/jobs", show: profileInfo },
    { label: "Membership", path: "/membership", show: profileInfo },
    { label: "Account", path: "/account", show: profileInfo },
  ];

  return (
    <header className="flex h-16 w-full shrink-0 items-center px-4 bg-gray-100 dark:bg-gray-800 shadow-md">
      <Sheet>
        <SheetTrigger asChild>
          <Button className="lg:hidden">
            <AlignJustify className="h-6 w-6" />
            <span className="sr-only">Toggle Navigation Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <Link className="mr-6 hidden lg:flex" href={"#"}>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              CareerX
            </h3>
          </Link>
          <div className="grid gap-2 py-6">
            {menuItems.map((menuItem) =>
              menuItem.show ? (
                <Link
                  key={menuItem.path}
                  href={menuItem.path}
                  className="flex w-full items-center py-2 text-lg font-semibold text-gray-800 dark:text-gray-200"
                >
                  {menuItem.label}
                </Link>
              ) : null
            )}
            <Moon
              className="cursor-pointer mb-4 text-gray-600 dark:text-gray-300"
              fill={theme === "dark" ? "light" : "dark"}
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            />
            <UserButton afterSignOutUrl="/" />
          </div>
        </SheetContent>
      </Sheet>
      <Link
        className="hidden font-bold text-3xl lg:flex mr-6 text-gray-900 dark:text-white"
        href={"/"}
      >
        CareerX
      </Link>
      <nav className="ml-auto hidden lg:flex gap-6 items-center">
        {menuItems.map((menuItem) =>
          menuItem.show ? (
            <Link
              key={menuItem.path}
              href={menuItem.path}
              onClick={() => sessionStorage.removeItem("filterParams")}
              className="group inline-flex h-9 w-max items-center rounded-md px-4 py-2 text-sm font-medium text-gray-800 dark:text-gray-200"
            >
              {menuItem.label}
            </Link>
          ) : null
        )}
        {user && (
          <div className="relative">
            <Button
              className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
              onClick={handleNotificationClick}
            >
              <Bell
                className={`h-6 w-6 ${
                  unreadCount > 0
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-300"
                } transition-colors duration-300`}
              />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold shadow-md">
                  {unreadCount}
                </span>
              )}
            </Button>
            {isDropdownOpen && (
              <div
                ref={dropdownRef}
                className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 shadow-lg rounded-lg overflow-hidden z-10 border border-gray-200 dark:border-gray-700"
              >
                <h4 className="font-semibold text-gray-800 dark:text-gray-100 p-4 border-b border-gray-200 dark:border-gray-700">
                  Notifications
                </h4>
                {notifications.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 p-4">
                    No new notifications
                  </p>
                ) : (
                  notifications.map((notification) => (
                    notification.read === false ? (
                      <div
                        key={notification._id}
                        className={`p-4 border-b last:border-b-0 ${
                          notification.read
                            ? "bg-gray-100 dark:bg-gray-800"
                            : "bg-blue-50 dark:bg-blue-900"
                        }`}
                      >
                        <p
                          className={`text-sm ${
                            notification.read
                              ? "text-gray-600 dark:text-gray-300"
                              : "text-blue-800 dark:text-blue-200"
                          }`}
                        >
                          {notification.message}
                        </p>
                      </div>
                    ) : null 
                  ))
                  
                )}
                {notifications.length > 0 && (
                  <Button
                    className="w-full bg-blue-600 text-white rounded-md py-2 mt-2 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                    onClick={handleMarkAllAsRead}
                  >
                    Mark all as read
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
        <Moon
          className="cursor-pointer text-gray-600 dark:text-gray-300"
          fill={theme === "dark" ? "light" : "dark"}
          onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        />
        <UserButton afterSignOutUrl="/" />
      </nav>
    </header>
  );
}

export default Header;
