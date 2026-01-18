"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Users, Search, Settings, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const FloatingDock = () => {
    const pathname = usePathname();

    const navItems = [
        { name: "Home", href: "/", icon: Home },
        { name: "Records", href: "/records", icon: Search },
        { name: "Create", href: "/create", icon: PlusCircle }, // Assuming mock create
        { name: "Characters", href: "/characters", icon: Users },
        { name: "Settings", href: "/settings", icon: Settings },
    ];

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <div className="flex items-center gap-2 px-4 py-3 rounded-full border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl relative">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "relative flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-300 group",
                                isActive ? "text-white" : "text-slate-400 hover:text-white"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="dock-bubble"
                                    className="absolute inset-0 bg-white/10 rounded-full border border-white/20"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}

                            <Icon size={24} className="relative z-10 group-hover:scale-110 transition-transform duration-200" />

                            {/* Tooltip */}
                            <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-black/80 border border-white/10 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                                {item.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};
