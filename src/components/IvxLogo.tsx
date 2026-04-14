import { motion } from "motion/react";

export function IvxLogo({ className }: { className?: string }) {
  return (
    <motion.img
      src="https://c.top4top.io/p_3751fcp801.jpeg"
      alt="ivx Logo"
      className={`rounded-full object-cover ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      referrerPolicy="no-referrer"
    />
  );
}
