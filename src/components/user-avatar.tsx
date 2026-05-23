import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "lucide-react"

export function UserAvatar({ src, name, className }: { src?: string | null; name?: string | null; className?: string }) {
  return (
    <Avatar className={className}>
      <AvatarImage src={src || ""} alt={name || "User"} />
      <AvatarFallback>{name?.slice(0, 1).toUpperCase() || <User className="h-4 w-4" />}</AvatarFallback>
    </Avatar>
  )
}
