'use client'
import { useEffect, useMemo, useState } from 'react'
import { ChevronsUpDown, Compass, Menu, PlusCircleIcon } from 'lucide-react'
import {
  Agency,
  AgencySidebarOption,
  SubAccount,
  SubAccountSidebarOption,
} from '@prisma/client'
import Image from 'next/image'
import Link from 'next/link'

import { icons } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useModal } from '@/providers/modal-provider'
import SubAccountDetails from '../forms/subaccount-details'
import CustomModal from '../global/custom-modal'
import { AspectRatio } from '../ui/aspect-ratio'
import { Button } from '../ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Separator } from '../ui/separator'
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '../ui/sheet'

type Props = {
  defaultOpen?: boolean
  subAccounts: SubAccount[]
  sidebarOpt: AgencySidebarOption[] | SubAccountSidebarOption[]
  sidebarLogo: string
  details: any
  user: any
  id: string
}

const MenuOptions = ({
  defaultOpen,
  details,
  id,
  sidebarLogo,
  sidebarOpt,
  subAccounts,
  user,
}: Props) => {
  //Open state
  const openState = useMemo(
    () => (defaultOpen ? { open: true } : {}),
    [defaultOpen]
  )

  //modal hook

  const { setOpen } = useModal()

  //Hydration
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  if (!mounted) return null

  return (
    <Sheet modal={false} {...openState}>
      <SheetTrigger
        asChild
        className="absolute left-4 top-4 z-[100] md:hidden flex"
      >
        <Button variant="outline" size="icon">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent
        showX={true}
        side="left"
        className={cn(
          'bg-background/80 backdrop-blur-xl fixed top-0 border-r-[1px] p-6',
          {
            'hidden md:inline-block z-0 w-[300px]': defaultOpen,
            'inline-block md:hidden z-[100] w-full': !defaultOpen,
          }
        )}
      >
        <div>
          <AspectRatio ratio={16 / 5}>
            <Image
              src={sidebarLogo}
              alt="sidebar logo"
              fill
              className="rounded-md object-contain"
            />
          </AspectRatio>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className="w-full my-4 flex items-center justify-between py-8"
                variant="ghost"
              >
                <div className="flex items-center text-left gap-2">
                  <Compass />
                  <div className="flex flex-col">
                    {details.name}
                    <span className="text-muted-foreground">
                      {details.address}
                    </span>
                  </div>
                </div>
                <div>
                  <ChevronsUpDown size={16} className="text-muted-foreground" />
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 h-80 mt-4 z-[200]">
              <Command className="rounded-lg">
                <CommandInput placeholder="Search Accounts ..." />
                <CommandList className="pb-16">
                  <CommandEmpty>No results found.</CommandEmpty>
                  {(user?.role === 'AGENCY_OWNER' ||
                    user?.role === 'AGENCY_ADMIN') &&
                    user?.Agency && (
                      //=====================
                      //=========Agency========
                      //=====================

                      <CommandGroup heading="Agency">
                        <CommandItem className="!bg-transparent my-2 text-primary border-[1px] border-border p-2 rounded-md hover:!bg-muted cursor-pointer transition-all">
                          {defaultOpen ? (
                            <Link
                              href={`/agency/${user?.Agency?.id}`}
                              className="flex gap-4 w-full h-full"
                            >
                              <div className="relative w-16">
                                <Image
                                  src={user?.Agency?.agencyLogo}
                                  alt="agencylogo"
                                  fill
                                  className="rounded-md object-contain"
                                />
                              </div>
                              <div className="flex flex-col flex-1">
                                {user?.Agency?.name}
                                <span className="text-muted-foreground">
                                  {user?.Agency?.address}
                                </span>
                              </div>
                            </Link>
                          ) : (
                            <SheetClose asChild>
                              <Link
                                href={`/agency/${user?.Agency?.id}`}
                                className="flex gap-4 w-full h-full"
                              >
                                <div className="relative w-16">
                                  <Image
                                    src={user?.Agency?.agencyLogo}
                                    alt="agencylogo"
                                    fill
                                    className="rounded-md object-contain"
                                  />
                                </div>
                                <div className="flex flex-col flex-1">
                                  {user?.Agency?.name}
                                  <span className="text-muted-foreground">
                                    {user?.Agency?.address}
                                  </span>
                                </div>
                              </Link>
                            </SheetClose>
                          )}
                        </CommandItem>
                      </CommandGroup>
                    )}
                  {/* =========== */}
                  {/* SUBACCOUNTS */}
                  {/* =========== */}
                  <CommandGroup heading="Accounts">
                    {!!subAccounts
                      ? subAccounts.map((subaccount) => (
                          <CommandItem key={subaccount.id}>
                            {defaultOpen ? (
                              <Link
                                href={`/subaccount/${subaccount.id}`}
                                className="flex gap-4 w-full h-full"
                              >
                                <div className="relative w-16">
                                  <Image
                                    src={subaccount.subAccountLogo}
                                    alt="subaccount logo"
                                    fill
                                    className="rounded-md object-contain"
                                  />
                                </div>
                                <div className="flex flex-col flex-1">
                                  {subaccount.name}
                                  <span className="text-muted-foreground">
                                    {subaccount.address}
                                  </span>
                                </div>
                              </Link>
                            ) : (
                              <SheetClose asChild>
                                <Link
                                  href={`/subaccount/${subaccount.id}`}
                                  className="flex gap-4 w-full h-full"
                                >
                                  <div className="relative w-16">
                                    <Image
                                      src={subaccount.subAccountLogo}
                                      alt="subaccount logo"
                                      fill
                                      className="rounded-md object-contain"
                                    />
                                  </div>
                                  <div className="flex flex-col flex-1">
                                    {subaccount.name}
                                    <span className="text-muted-foreground">
                                      {subaccount.address}
                                    </span>
                                  </div>
                                </Link>
                              </SheetClose>
                            )}
                          </CommandItem>
                        ))
                      : 'No accounts.'}
                  </CommandGroup>
                </CommandList>
                {(user?.role === 'AGENCY_OWNER' ||
                  user?.role === 'AGENCY_ADMIN') && (
                  <SheetClose>
                    <Button
                      className="w-full flex gap-2"
                      onClick={() =>
                        setOpen(
                          <CustomModal
                            title="Create a Sub account"
                            subheading="You can switch between your agency account and the subaccount from the sidebar"
                          >
                            <SubAccountDetails
                              agencyDetails={user?.Agency as Agency}
                              userId={user?.id as string}
                              userName={user?.name}
                            />
                          </CustomModal>
                        )
                      }
                    >
                      <PlusCircleIcon size={15} />
                      Create Sub Account
                    </Button>
                  </SheetClose>
                )}
              </Command>
            </PopoverContent>
          </Popover>
          <div className="text-muted-foreground text-xs mb-2">
            MENU LINKS
            <Separator className="mb-4" />
            <nav className="relative">
              <Command className="rounded-lg overflow-visible bg-transparent">
                <CommandInput placeholder="Search..." />
                <CommandList className="pb-16 overflow-visible">
                  <CommandEmpty>No Results Found</CommandEmpty>
                  <CommandGroup className="overflow-visible">
                    {sidebarOpt.map((sidebarOpt) => {
                      let val
                      const result = icons.find(
                        (icon) => icon.value === sidebarOpt.icon
                      )

                      if (result) {
                        val = <result.path />
                      }
                      return (
                        <CommandItem
                          key={sidebarOpt.id}
                          className="md:w-[320px] w-full"
                        >
                          <Link
                            href={sidebarOpt.link}
                            className="flex items-center gap-2 hover:bg-tranparent rounded-md transition-all md:w-full w-[320px]"
                          >
                            {val}
                            <span>{sidebarOpt.name}</span>
                          </Link>
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </nav>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default MenuOptions
