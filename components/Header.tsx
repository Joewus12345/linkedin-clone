'use client'

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"
import { Briefcase, HomeIcon, Menu, MessagesSquare, SearchIcon, UsersIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "./ui/button"
import { useCallback, useRef, useState } from "react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { usePathname, useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet"
import { useHeaderVisibility } from "@/actions/useHeaderVisibility"

// Define the User type
interface User {
  userId: string;
  userImage: string;
  firstName: string;
  lastName: string;
}

// Define the Post type
interface Post {
  _id: string;
  text: string;
  user: {
    userId: string;
    firstName: string;
    lastName?: string;
    userImage?: string;
  };
}

// Debounce function to avoid frequent API calls
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const debounce = <T extends (...args: any[]) => void>(func: T, delay: number) => {
  let timer: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const isVisible = useHeaderVisibility();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<{ users: User[]; posts: Post[] }>({ users: [], posts: [] });
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  // State for toggling the "See More" button
  const [expandedUsers, setExpandedUsers] = useState(false);
  const [expandedPosts, setExpandedPosts] = useState(false);

  // Fetch search results
  const fetchSearchResults = async (query: string) => {
    if (!query.trim()) return;

    try {
      setIsSearching(true);
      setShowDropdown(true);

      const response = await fetch(`/api/search-users?query=${query}`);
      const data = await response.json();

      if (response.ok) {
        setSearchResults(data);
      } else {
        toast.error(data.error || "Failed to fetch users");
      }
    } catch (error) {
      console.error("Error during search:", error);
      toast.error("An error occurred while searching");
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce search function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSearch = useCallback(debounce(fetchSearchResults, 500), []);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    handleSearch(value);
  };

  // Handle profile navigation
  const handleProfileClick = (userId: string) => {
    setShowDropdown(false); // Close the dropdown
    setTimeout(() => router.push(`/profile/${userId}`), 100); // Navigate programmatically
  };

  // Handle post navigation
  const handlePostClick = (postId: string) => {
    setShowDropdown(false);
    setTimeout(() => router.push(`/posts/${postId}`), 100);
  };

  // Handle blur event for dropdown
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!dropdownRef.current?.contains(e.relatedTarget)) {
      setTimeout(() => setShowDropdown(false), 200);
    }
  };

  return (
    <div>
      <div
        className={`border-b bg-white transition-transform duration-300 z-50 shadow-md ${isVisible ? "translate-y-0" : "-translate-y-full"} sm:translate-y-0`}
      >
        <div className="flex items-center p-2 max-w-6xl mx-auto overflow-hidden">
          <Image
            className="rounded-lg cursor-pointer"
            src="https://links.papareact.com/b3z"
            width={40}
            height={40}
            alt="logo"
            onClick={() => router.push("/")}
          />

          <div className="flex-1">
            <form
              className="flex items-center space-x-1 bg-gray-100 p-2 rounded-md flex-1 mx-2 max-w-96"
              onSubmit={(e) => e.preventDefault()}
            >
              <SearchIcon className="h-4 text-gray-600" />
              <input
                type="text"
                placeholder="Search for people or posts..."
                className="bg-transparent flex-1 outline-none"
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={() => setShowDropdown(true)}
                onBlur={handleBlur}
              />
            </form>

            {/* Search Results Dropdown */}
            {showDropdown && (
              <div
                ref={dropdownRef}
                className="absolute top-full w-full lg:max-w-lg bg-white shadow-md rounded-md z-50 mt-1 sm:max-w-sm xs:max-w-xs md:max-w-md xl:max-w-xl sm:mx-auto overflow-y-scroll scrollbar-hide left-0 sm:left-auto overflow-x-hidden max-h-[400px] pb-10"
              >
                {/* Show "Searching..." while fetching */}
                {isSearching && (
                  <div className="p-3 text-sm text-gray-500 text-center">
                    Searching...
                  </div>
                )}

                {/* No results found */}
                {!isSearching && searchResults.users.length === 0 && searchResults.posts.length === 0 && (
                  <div className="p-3 text-sm text-gray-500 text-center">
                    No results found
                  </div>
                )}

                {/* People Section */}
                {searchResults.users.length > 0 && (
                  <>
                    <h3 className="px-4 py-2 text-sm font-semibold text-gray-500">
                      People
                    </h3>
                    <hr />
                    {searchResults.users.slice(0, expandedUsers ? searchResults.users.length : 2).map((user) => (
                      <div
                        key={user.userId}
                        className="flex items-center space-x-4 p-2 hover:bg-gray-100 cursor-pointer transition-all duration-150 rounded-lg"
                        onMouseDown={() => handleProfileClick(user.userId)}
                      >
                        <Avatar>
                          <AvatarImage src={user.userImage} />
                          <AvatarFallback>
                            {user.firstName.charAt(0)}
                            {user.lastName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <p className="font-semibold text-gray-800">
                            {`${user.firstName} ${user.lastName || ""}`}
                          </p>
                          <p className="text-xs text-gray-500">View Profile</p>
                        </div>
                      </div>
                    ))}

                    {searchResults.users.length > 2 && (
                      <button
                        className="w-full text-xs text-blue-600 hover:underline"
                        onClick={() => setExpandedUsers(!expandedUsers)}
                      >
                        {expandedUsers ? "Show less" : "See more..."}
                      </button>
                    )}
                  </>
                )}

                {/* Posts Section */}
                {searchResults.posts.length > 0 && (
                  <>
                    <h3 className="px-4 py-2 text-sm font-semibold text-gray-500 mt-2">
                      Posts
                    </h3>
                    <hr />
                    {searchResults.posts.slice(0, expandedPosts ? searchResults.posts.length : 2).map((post) => (
                      <div
                        key={post._id}
                        className="flex items-start space-x-4 p-2 hover:bg-gray-100 cursor-pointer transition-all duration-150 rounded-lg"
                        onMouseDown={() => handlePostClick(post._id)}
                      >
                        <Avatar>
                          <AvatarImage src={post.user.userImage} />
                          <AvatarFallback>
                            {post.user.firstName.charAt(0)}
                            {post.user.lastName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <p className="font-semibold text-gray-800">
                            {`${post.user.firstName} ${post.user.lastName || ""}`}
                          </p>
                          <p className="text-sm text-gray-600 truncate max-w-xs">{post.text.substring(0, 50)}...</p>
                        </div>
                      </div>
                    ))}

                    {searchResults.posts.length > 2 && (
                      <button
                        className="w-full text-xs text-blue-600 hover:underline"
                        onClick={() => setExpandedPosts(!expandedPosts)}
                      >
                        {expandedPosts ? "Show less" : "See more..."}
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center space-x-4 px-6">
            <Link href="/"
              className={`flex flex-col flex-1 items-center px-4 py-1 ${pathname === "/" ? "border-b-4 rounded-b-sm border-black text-black" : "text-gray-500 opacity-60"} transition-all duration-300 ease-in-out `}
            >
              <HomeIcon className="h-5 fill-white" />
              <p className="text-xs">Home</p>
            </Link>

            <Link href="/network"
              className={`flex flex-col flex-1 items-center px-4 py-1 ${pathname === "/network" ? "border-b-4 rounded-b-sm border-black text-black" : "text-gray-500 opacity-60"} transition-all duration-300 ease-in-out`}
            >
              <UsersIcon className="h-5 fill-white" />
              <p className="text-xs">Network</p>
            </Link>

            <a
              onClick={(e) => e.preventDefault()}
              className={`flex flex-col flex-1 items-center px-4 py-1 text-gray-400 pointer-events-none cursor-not-allowed transition-all duration-300 ease-in-out`}
            >
              <Briefcase className="h-5 fill-white" />
              <p className="text-xs">Jobs</p>
            </a>

            <a
              onClick={(e) => e.preventDefault()}
              className={`flex flex-col flex-1 items-center px-4 py-1 text-gray-400 pointer-events-none cursor-not-allowed transition-all duration-300 ease-in-out`}
            >
              <MessagesSquare className="h-5 fill-white" />
              <p className="text-xs">Messaging</p>
            </a>

            {/* User Button if signed in */}
            <SignedIn>
              <UserButton />
            </SignedIn>

            {/* Sign In Button if not signed in */}
            <SignedOut>
              <Button asChild variant="secondary" className="mr-5">
                <SignInButton />
              </Button>
            </SignedOut>
          </div>

          {/* Mobile Navigation - Sheet Component */}
          <div className="sm:hidden flex items-center">
            {/* User Button if signed in */}
            <SignedIn>
              <UserButton />
            </SignedIn>

            {/* Sign In Button if not signed in */}
            <SignedOut>
              <Button asChild variant="secondary" className="mr-2">
                <SignInButton />
              </Button>
            </SignedOut>

            <SignedIn>
              <Sheet>
                <SheetTrigger asChild>
                  <Menu className="text-2xl cursor-pointer ml-3" />
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>LinkedIn</SheetTitle>
                  </SheetHeader>
                  <Link href="/"
                    className={`flex flex-1 justify-center items-center px-2 py-2 ${pathname === "/" ? "border rounded-sm border-black text-black" : "text-gray-500 opacity-60"} transition-all duration-300 ease-in-out `}
                  >
                    <HomeIcon className="h-5 fill-white" />
                    <p className="text-xs">Home</p>
                  </Link>

                  <Link href="/network"
                    className={`flex flex-1 justify-center items-center px-2 py-2 ${pathname === "/network" ? "border rounded-sm border-black text-black" : "text-gray-500 opacity-60"} transition-all duration-300 ease-in-out`}
                  >
                    <UsersIcon className="h-5 fill-white" />
                    <p className="text-xs">Network</p>
                  </Link>

                  <div
                    className={`flex flex-1 justify-center items-center px-2 py-2 text-gray-400 pointer-events-none cursor-not-allowed transition-all duration-300 ease-in-out`}
                  >
                    <Briefcase className="h-5 fill-white" />
                    <p className="text-xs">Jobs</p>
                  </div>

                  <div
                    className={`flex flex-1 justify-center items-center px-2 py-2 text-gray-400 pointer-events-none cursor-not-allowed transition-all duration-300 ease-in-out`}
                  >
                    <MessagesSquare className="h-5 fill-white" />
                    <p className="text-xs">Messaging</p>
                  </div>
                </SheetContent>
              </Sheet>
            </SignedIn>
          </div>
        </div>
      </div>

      {/* Bottom navigation for Mobile Iteration 1*/}
      <div className={`fixed bottom-0 left-0 w-full bg-white flex justify-around items-center p-3 border-t border-gray-300 sm:hidden transition-transform duration-300 ${isVisible ? "translate-y-0" : "translate-y-full"}`}>
        <Link href="/"
          className={`flex flex-col flex-1 items-center px-2 pt-2 ${pathname === "/" ? "border-t-4 rounded-t-sm border-black text-black" : "text-gray-500 opacity-60"} transition-all duration-300 ease-in-out `}
        >
          <HomeIcon className="h-5 fill-white" />
          <p className="text-xs">Home</p>
        </Link>

        <Link href="/network"
          className={`flex flex-col flex-1 items-center px-2 pt-2 ${pathname === "/network" ? "border-t-4 rounded-t-sm border-black text-black" : "text-gray-500 opacity-60"} transition-all duration-300 ease-in-out`}
        >
          <UsersIcon className="h-5 fill-white" />
          <p className="text-xs">Network</p>
        </Link>

        <div
          className={`flex flex-col flex-1 justify-center items-center px-2 pt-2 text-gray-400 pointer-events-none cursor-not-allowed transition-all duration-300 ease-in-out`}
        >
          <Briefcase className="h-5 fill-white" />
          <p className="text-xs">Jobs</p>
        </div>

        <div
          className={`flex flex-col flex-1 justify-center items-center px-2 pt-2 text-gray-400 pointer-events-none cursor-not-allowed transition-all duration-300 ease-in-out`}
        >
          <MessagesSquare className="h-5 fill-white" />
          <p className="text-xs">Messaging</p>
        </div>
      </div>
    </div>
  )
}

export default Header