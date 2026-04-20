import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_MAP = {
  sm: { w: 100, h: 50 },
  md: { w: 160, h: 80 },
  lg: { w: 220, h: 110 },
}

export function Logo({ className, size = 'md' }: LogoProps) {
  const { w, h } = SIZE_MAP[size]

  return (
    <div className={cn('flex items-center', className)}>
      <Image
        src="/logo.png"
        alt="בונים עולמות"
        width={w}
        height={h}
        className="object-contain shrink-0"
        priority
      />
    </div>
  )
}
