import { useState } from "react";
import { Wallet } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { image: "h-5", text: "text-sm", icon: "w-4 h-4", container: "w-6 h-6", gap: "gap-1.5" },
  md: { image: "h-7", text: "text-lg", icon: "w-5 h-5", container: "w-10 h-10", gap: "gap-2" },
  lg: { image: "h-14", text: "text-2xl", icon: "w-8 h-8", container: "w-16 h-16", gap: "gap-3" },
};

export function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const [imageError, setImageError] = useState(false);
  const sizes = sizeMap[size];
  
  return (
    <div className={`flex items-center ${sizes.gap} ${className}`}>
      {!imageError ? (
        <img
          src="/logo.png"
          alt="MoneyLens.ai"
          className={`${sizes.image} w-auto object-contain flex-shrink-0`}
          style={{ display: "block" }}
          onError={() => setImageError(true)}
        />
      ) : (
        <div className={`${sizes.container} bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0`}>
          <Wallet className={`${sizes.icon} text-white`} />
        </div>
      )}
      {showText && (
        <span 
          className={`${sizes.text} font-bold whitespace-nowrap leading-tight flex items-baseline`}
          style={{ marginTop: "6px" }}
        >
          <span className="text-white">MoneyLens</span>
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">.ai</span>
        </span>
      )}
    </div>
  );
}

