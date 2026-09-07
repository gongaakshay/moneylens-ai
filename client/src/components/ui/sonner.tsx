import { useTheme } from "@/hooks/use-theme"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-slate-800 group-[.toaster]:text-white group-[.toaster]:border-slate-700 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-slate-400",
          actionButton:
            "group-[.toast]:bg-emerald-500 group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-slate-700 group-[.toast]:text-slate-300",
          success: "group-[.toast]:bg-emerald-900/50 group-[.toast]:border-emerald-500/20",
          error: "group-[.toast]:bg-red-900/50 group-[.toast]:border-red-500/20",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

