import { CheckCircle2 } from "lucide-react";
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

const benefits = [
  "AI-powered financial health scores",
  "Track unlimited income and expenses",
  "Beautiful charts and visualizations",
  "Personalized spending recommendations",
  "Monthly financial summaries",
  "Carry-forward balance tracking",
  "Need/Want/Neutral categorization",
  "Smart caching for instant insights",
];

export function BenefitsSection() {
  return (
    <motion.div
      className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24"
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-100px" }}
      variants={staggerContainer}
    >
      <motion.div
        className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 rounded-2xl p-12"
        variants={fadeInUp}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div variants={fadeInUp}>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Why choose MoneyLens.ai?
            </h2>
            <p className="text-lg text-slate-400 mb-8">
              Join thousands of users who have taken control of their financial
              future with AI-powered insights and intuitive expense tracking.
            </p>
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              variants={staggerContainer}
            >
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-3"
                  variants={fadeInUp}
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-300 text-sm">{benefit}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
          <motion.div className="relative" variants={scaleIn}>
            <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded-xl p-8 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                <span className="text-slate-400 text-sm">This Month</span>
                <span className="text-emerald-400 text-sm font-medium">
                  December 2025
                </span>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Groceries", amount: "$450", color: "red" },
                  { label: "Rent", amount: "$1,200", color: "orange" },
                  { label: "Entertainment", amount: "$150", color: "purple" },
                  { label: "Utilities", amount: "$220", color: "blue" },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full bg-${item.color}-400`}
                      />
                      <span className="text-slate-300">{item.label}</span>
                    </div>
                    <span className="text-white font-medium">
                      {item.amount}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
