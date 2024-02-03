import { ModeToggle } from '@/components/global/mode-toggle'
import { buttonVariants } from '@/components/ui/button'
import { UserButton } from '@clerk/nextjs'
import { User } from '@clerk/nextjs/server'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

type Props = {
  user?: null | User
}

const Navigation = ({ user }: Props) => {
  return (
    <div className="fixed top-0 right-0 left-0 p-4 flex items-center justify-between z-10">
      <aside className="flex items-center gap-2">
        <Image
          src={'/assets/golden-logo.png'}
          width={40}
          height={40}
          alt="logo"
        />
        <span className="text-xl font-bold">SupAgency.</span>
      </aside>
      <nav className="hidden lg:block absolute left-[50%] top-[50%] transform translate-x-[-50%] translate-y-[-50%]">
        <ul className="flex items-center justify-center gap-8">
          <Link
            href={'#'}
            className={buttonVariants({
              variant: 'outline',
              className: 'bg-transparent border-transparent text-slate-900',
            })}
          >
            Pricing
          </Link>
          <Link
            href={'#'}
            className={buttonVariants({
              variant: 'outline',
              className: 'bg-transparent border-transparent text-slate-900',
            })}
          >
            About
          </Link>
          <Link
            href={'#'}
            className={buttonVariants({
              variant: 'outline',
              className: 'bg-transparent border-transparent text-slate-900',
            })}
          >
            Documentation
          </Link>
          <Link
            href={'#'}
            className={buttonVariants({
              variant: 'outline',
              className: 'bg-transparent border-transparent text-slate-900',
            })}
          >
            Features
          </Link>
        </ul>
      </nav>
      <aside className="flex gap-2 items-center">
        <Link
          href={'/agency'}
          className={buttonVariants({
            variant: 'outline',
            className: 'p-2 px-4',
          })}
        >
          {user ? 'Dash Board' : 'Login'}
        </Link>
        <UserButton />
        <ModeToggle />
      </aside>
    </div>
  )
}

export default Navigation
