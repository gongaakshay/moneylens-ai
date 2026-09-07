import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";

interface CTASectionProps {
  user: { name?: string; username: string } | null;
}

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export function CTASection({ user }: CTASectionProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24"
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      variants={staggerContainer}
    >
      <div className="text-center space-y-8">
        <motion.h2
          className="text-4xl sm:text-5xl font-bold text-white"
          variants={fadeInUp}
        >
          Ready to take control?
        </motion.h2>
        <motion.p
          className="text-xl text-slate-400 max-w-2xl mx-auto"
          variants={fadeInUp}
        >
          Join today and start making smarter financial decisions.
        </motion.p>
        <motion.div variants={fadeInUp}>
          {user ? (
            <Button
              size="lg"
              onClick={() => navigate("/dashboard")}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold text-lg px-12 py-6 shadow-2xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
            >
              <LayoutDashboard className="w-5 h-5 mr-2" />
              Go to Dashboard
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={() => navigate("/register")}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold text-lg px-12 py-6 shadow-2xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
            >
              Get Started for Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

