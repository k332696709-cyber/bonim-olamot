import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const SIZE_MAP = {
  sm: { px: 32,  textSize: 'text-base' },
  md: { px: 44,  textSize: 'text-lg'   },
  lg: { px: 64,  textSize: 'text-2xl'  },
}

export function Logo({ className, size = 'md' }: LogoProps) {
  const { px, textSize } = SIZE_MAP[size]

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Image
        src="/logo.png"
        alt="בונים עולמות"
        width={px}
        height={px}
        className="object-contain shrink-0"
        priority
      />
      <div className="flex flex-col leading-tight">
        <span className={cn('font-serif font-bold text-navy-500', textSize)}>
          בונים עולמות
        </span>
        <span className="text-gray-400 text-xs font-normal tracking-wide">
          שידוכים בדרך האמת
        </span>
      </div>
    </div>
  )
}
