import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  BarChart3,
  Wallet,
  ArrowRight,
  LayoutDashboard,
  Brain,
  Star,
} from "lucide-react";
import { motion } from "framer-motion";

interface HeroSectionProps {
  user: { name?: string; username: string } | null;
}

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] as const },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5 },
};

export function HeroSection({ user }: HeroSectionProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      <div className="text-center space-y-8">
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium"
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={fadeInUp.transition}
        >
          <Brain className="w-4 h-4" />
          AI-Powered Financial Management
        </motion.div>

        <motion.h1
          className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight"
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={fadeInUp.transition}
        >
          <span className="text-white">Track Your Finances</span>
          <br />
          <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Effortlessly
          </span>
        </motion.h1>

        <motion.p
          className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={fadeInUp.transition}
        >
          Take control of your money with AI-powered insights, intelligent
          expense tracking, beautiful visualizations, and personalized
          recommendations. Get your financial health score and know exactly
          where your money goes.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={fadeInUp.transition}
        >
          {user ? (
            <Button
              size="lg"
              onClick={() => navigate("/dashboard")}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold text-lg px-8 py-6 shadow-2xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
            >
              <LayoutDashboard className="w-5 h-5 mr-2" />
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Button
                size="lg"
                onClick={() => navigate("/register")}
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold text-lg px-8 py-6 shadow-2xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all"
              >
                Get Started for Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                onClick={() => navigate("/login")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg px-8 py-6 shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
              >
                View Demo
              </Button>
            </>
          )}
        </motion.div>

        <motion.div
          className="flex flex-col items-center gap-3"
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={fadeInUp.transition}
        >
          <p className="text-sm text-slate-500">
            {user
              ? `Welcome back, ${user.name || user.username}!`
              : "Free forever. No credit card required."}
          </p>
          <a
            href="https://github.com/alok722/moneylens-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-yellow-400 transition-colors group"
          >
            <Star className="w-4 h-4 group-hover:fill-yellow-400 transition-all" />
            Star us on GitHub — it helps a lot!
          </a>
        </motion.div>
      </div>

      {/* Dashboard Preview */}
      <motion.div
        className="mt-20 relative"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10" />
        <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-2xl shadow-emerald-500/10 backdrop-blur-sm bg-slate-900/50 p-8">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div
              className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-xl p-6"
              variants={scaleIn}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
            >
              <TrendingUp className="w-8 h-8 text-emerald-400 mb-3" />
              <p className="text-2xl font-bold text-white mb-1">$12,450</p>
              <p className="text-sm text-slate-400">Total Income</p>
            </motion.div>
            <motion.div
              className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl p-6"
              variants={scaleIn}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
            >
              <BarChart3 className="w-8 h-8 text-red-400 mb-3" />
              <p className="text-2xl font-bold text-white mb-1">$8,320</p>
              <p className="text-sm text-slate-400">Total Expenses</p>
            </motion.div>
            <motion.div
              className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6"
              variants={scaleIn}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
            >
              <Wallet className="w-8 h-8 text-blue-400 mb-3" />
              <p className="text-2xl font-bold text-white mb-1">$4,130</p>
              <p className="text-sm text-slate-400">Balance</p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

