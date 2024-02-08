'use client'

import { Tag } from '@prisma/client'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog'
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '../ui/command'
import TagComponent from './tag'
import { PlusCircleIcon, TrashIcon, X } from 'lucide-react'
import { toast } from '../ui/use-toast'
import { v4 } from 'uuid'
import {
  deleteTag,
  getTagsForSubaccount,
  saveActivityLogsNotification,
  upsertTag,
} from '@/lib/queries'

type Props = {
  subaccountId: string
  getSelectedTags: (tags: Tag[]) => void
  defaultTags?: Tag[]
}

const TagColors = ['BLUE', 'ORANGE', 'ROSE', 'PURPLE', 'GREEN'] as const

export type TagColor = (typeof TagColors)[number]

const TagCreator = ({ subaccountId, getSelectedTags, defaultTags }: Props) => {
  const [selectedTags, setSelectedTags] = useState<Tag[]>(defaultTags || [])

  const [tags, setTags] = useState<Tag[]>([])
  const router = useRouter()
  const [value, setValue] = useState('')
  const [selectedColor, setSelectedColor] = useState('')

  useEffect(() => {
    getSelectedTags(selectedTags)
  }, [selectedTags])

  const handleDeleteSelection = (tagId: string) => {
    setSelectedTags((prev) => prev.filter((tag) => tag.id !== tagId))
  }

  const handleAddTag = async () => {
    if (!value) {
      toast({
        variant: 'destructive',
        title: 'Tags need to have a name',
      })
      return
    }

    if (!selectedColor) {
      toast({
        variant: 'destructive',
        description: 'Please select a color',
      })
      return
    }

    //else
    const tagData: Tag = {
      id: v4(),
      color: selectedColor,
      name: value,
      subAccountId: subaccountId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setTags([...tags, tagData])
    setValue('')
    setSelectedColor('')

    try {
      const response = await upsertTag(subaccountId, tagData)

      toast({
        title: 'Created tag',
      })

      await saveActivityLogsNotification({
        description: `Updated a tag | ${response.name}`,
        subaccountId,
      })
    } catch (error) {
      toast({ variant: 'destructive', description: 'Could not create tag' })
    }
  }

  const handleDeleteTag = async (tagId: string) => {
    setTags(tags.filter((tag) => tag.id !== tagId))
    try {
      const response = await deleteTag(tagId)
      toast({
        title: 'Deleted tag',
        description: 'The tag is deleted from your subaccount.',
      })

      await saveActivityLogsNotification({
        description: `Deleted a tag | ${response?.name}`,
        subaccountId,
      })

      router.refresh()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Could not delete tag',
      })
    }
  }

  const handleAddSelections = (tag: Tag) => {
    if (selectedTags.every((t) => t.id !== tag.id)) {
      setSelectedTags([...selectedTags, tag])
    }
  }

  useEffect(() => {
    if (subaccountId) {
      const fetchTagData = async () => {
        const response = await getTagsForSubaccount(subaccountId)

        if (response) setTags(response.Tags)
      }

      fetchTagData()
    }
  }, [subaccountId])

  return (
    <AlertDialog>
      <Command className="bg-transparent">
        {!!selectedTags.length && (
          <div className="flex flex-wrap gap-2 p-2 bg-background border-2 border-border rounded-md">
            {selectedTags.map((tag) => (
              <div key={tag.id} className="flex items-center">
                <TagComponent title={tag.name} colorName={tag.color} />
                <X
                  size={14}
                  className="text-muted-foreground cursor-pointer"
                  onClick={() => handleDeleteSelection(tag.id)}
                />
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 my-2">
          {TagColors.map((cName) => (
            <TagComponent
              key={cName}
              selectedColor={setSelectedColor}
              title=""
              colorName={cName}
            />
          ))}
        </div>
        <div className="relative">
          <CommandInput
            placeholder="Type a command or Search"
            value={value}
            onValueChange={setValue}
          />
          <PlusCircleIcon
            onClick={handleAddTag}
            size={20}
            className="absolute top-1/2 transform -translate-y-1/2 right-2 hover:text-primary transition-all cursor-pointer text-muted-foreground"
          />
        </div>

        <CommandList>
          <CommandSeparator />

          <CommandGroup heading="Tags">
            {tags.map((tag) => (
              <CommandItem
                key={tag.id}
                className="hover:!bg-secondary !bg-transparent flex items-center justify-between !font-light cursor-pointer"
              >
                <div onClick={() => handleAddSelections(tag)}>
                  <TagComponent title={tag.name} colorName={tag.color} />
                </div>
                <AlertDialogTrigger>
                  <TrashIcon
                    size={16}
                    className="cursor-pointer text-muted-foreground hover:text-rose-400  transition-all"
                  />
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-left">
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-left">
                      This action cannot be undone. This will permanently delete
                      your the tag and remove it from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="items-center">
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive"
                      onClick={() => handleDeleteTag(tag.id)}
                    >
                      Delete Tag
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </AlertDialog>
  )
}

export default TagCreator
