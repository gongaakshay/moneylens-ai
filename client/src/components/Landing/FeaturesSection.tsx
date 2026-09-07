import {
  PieChart,
  TrendingUp,
  BarChart3,
  Shield,
  Brain,
} from "lucide-react";
import { motion } from "framer-motion";

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

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5 },
};

const features = [
  {
    icon: Brain,
    title: "AI-Powered Insights",
    description:
      "Get personalized financial health scores, spending analysis, and predictive recommendations powered by OpenAI.",
  },
  {
    icon: PieChart,
    title: "Smart Categorization",
    description:
      "Automatically categorize your expenses into Needs, Wants, and Neutral spending for better insights.",
  },
  {
    icon: TrendingUp,
    title: "Trend Analysis",
    description:
      "Track your financial progress over time with intuitive charts and carry-forward tracking.",
  },
  {
    icon: BarChart3,
    title: "Income vs Expense",
    description:
      "Visualize your monthly cash flow and understand where your money goes.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description:
      "Your financial data is encrypted and stored securely. Your privacy is our priority.",
  },
];

export function FeaturesSection() {
  return (
    <motion.div
      className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24"
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-100px" }}
      variants={staggerContainer}
    >
      <motion.div className="text-center mb-16" variants={fadeInUp}>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Everything you need to manage your money
        </h2>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Powerful features designed to give you complete control over your
          finances
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
        variants={staggerContainer}
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6 hover:border-emerald-500/50 transition-all hover:shadow-lg hover:shadow-emerald-500/10"
            variants={scaleIn}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center mb-4">
              <feature.icon className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {feature.title}
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

