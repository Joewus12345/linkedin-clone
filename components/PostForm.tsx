"use client"

import { useUser } from "@clerk/nextjs"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Button } from "./ui/button"
import { ImageIcon, XIcon } from "lucide-react"
import { useRef, useState } from "react"
import Image from "next/image"
import createPostAction from "@/actions/createPostAction"
import { toast } from "sonner"

function PostForm() {
  const { user } = useUser()

  const ref = useRef<HTMLFormElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const handlePostAction = async (formData: FormData): Promise<void> => {
    const formDataCopy = formData
    ref.current?.reset()

    const text = formDataCopy.get("postInput") as string

    if (!text.trim()) {
      throw new Error("You must provide a post input")
    }

    setPreview(null)

    try {
      await createPostAction(formDataCopy)
    } catch (error) {
      console.log("Error creating post", error)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPreview(URL.createObjectURL(file))
    }
  }

  return (
    <div className="mb-2">
      <form
        ref={ref} action={(formData) => {
          // Handle form submission with server action
          const promise = handlePostAction(formData)
          // Toast notification based on the promise above
          toast.promise(promise, {
            loading: "Creating post...",
            success: "Post created",
            error: "Failed to create post",
          })
        }}
        className="p-3 bg-white rounded-lg border"
      >
        <div className="flex items-center space-x-2">
          <Avatar>
            <AvatarImage src={user?.imageUrl} />
            <AvatarFallback>
              {user?.firstName?.charAt(0)}
              {user?.lastName?.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <input
            type="text"
            name="postInput"
            placeholder="Start writing a post..."
            className="flex-1 outline-none rounded-full py-3 px-4 border"
          />

          {/* Add input file selector for images only */}
          <input
            ref={fileInputRef}
            type="file"
            name="image"
            accept="image/*"
            hidden
            onChange={handleImageChange}
          />

          <button type="submit">
            Post
          </button>
        </div>

        {/* Preview conditional check */}
        {preview && (
          <div className="mt-2">
            <Image src={preview} width={1000} height={1000} alt="Preview" className="w-full object-cover" />
          </div>
        )}
        <div className="flex justify-end mt-2 space-x-2">
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            variant={preview ? "secondary" : "outline"}
          >
            <ImageIcon className="mr-2" size={16} color="currentColor" />
            {preview ? "Change" : "Add"} image
          </Button>

          {/* Add a remove preview button */}
          {preview && (
            <Button
              type="button"
              onClick={() => setPreview(null)}
              variant="outline"
            >
              <XIcon className="mr-2" size={16} color="currentColor" />
              Remove image
            </Button>
          )}
        </div>
      </form>

      <hr className="mt-2 border-gray-300" />
    </div>
  )
}

export default PostForm
