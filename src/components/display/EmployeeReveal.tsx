"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Honorific } from "@/lib/types";

type Props = {
  name: string;
  years: number;
  title: Honorific;
  visible: boolean;
};

export default function EmployeeReveal({
  name,
  years,
  title,
  visible,
}: Props) {
  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          key={`${title}-${name}-${years}`}
          className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-8 text-center md:px-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.p
            className="text-xl font-light tracking-wide text-white/80 md:text-3xl lg:text-4xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
          >
            Cảm ơn {title}
          </motion.p>

          <motion.h1
            className="display-name mt-4 max-w-[92vw] text-4xl font-semibold uppercase leading-tight tracking-wide text-white md:mt-6 md:text-6xl lg:text-7xl xl:text-8xl"
            initial={{ opacity: 0, scale: 0.92, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {name}
          </motion.h1>

          <motion.p
            className="mt-6 max-w-[90vw] text-base font-medium uppercase tracking-[0.12em] text-[#e8c96a] md:mt-8 md:text-xl lg:text-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.7 }}
          >
            Đã đồng hành cùng MB Life hơn{" "}
            <span className="text-3xl font-bold text-[#f5d77a] md:text-5xl lg:text-6xl">
              {years}
            </span>{" "}
            năm qua
          </motion.p>

          <motion.p
            className="mt-8 max-w-3xl text-base font-light leading-relaxed text-white/70 md:mt-12 md:text-xl lg:text-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.7 }}
          >
            Chúc {title} luôn vững bước, lan tỏa giá trị và cùng MB Life tiến
            bước rực rỡ, vạn dặm thăng hoa.
          </motion.p>

          <motion.div
            className="mt-10 h-px w-40 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent md:mt-14 md:w-56"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.1, duration: 0.8 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
