'use client'

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"
import { Briefcase, HomeIcon, MessagesSquare, SearchIcon, UsersIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "./ui/button"
import { useCallback, useRef, useState } from "react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { usePathname, useRouter } from "next/navigation"

// Define the User type
interface User {
  userId: string;
  userImage: string;
  firstName: string;
  lastName: string;
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

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
  const handleSearch = useCallback(debounce(fetchSearchResults, 500), [fetchSearchResults]);

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

  // Handle blur event for dropdown
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!dropdownRef.current?.contains(e.relatedTarget)) {
      setShowDropdown(false);
    }
  };

  return (
    <div className="flex items-center p-2 max-w-6xl mx-auto overflow-hidden">
      <Image
        className="rounded-lg"
        src="https://links.papareact.com/b3z"
        width={40}
        height={40}
        alt="logo"
      />

      <div className="flex-1">
        <form
          className="flex items-center space-x-1 bg-gray-100 p-2 rounded-md flex-1 mx-2 max-w-96"
          onSubmit={(e) => e.preventDefault()}
        >
          <SearchIcon className="h-4 text-gray-600" />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent flex-1 outline-none"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => setShowDropdown(true)}
            onBlur={handleBlur}
          />
        </form>

        {/* Search Results Dropdown */}
        {showDropdown && searchResults.length > 0 && (
          <div className="flex flex-col absolute top-full w-full lg:max-w-lg bg-white shadow-md rounded-md z-50 mt-1 mx-auto sm:max-w-sm xs:max-w-xs md:max-w-md xl:max-w-xl">
            {searchResults.map((user) => (
              <div
                key={user.userId}
                className="flex items-center space-x-4 p-3 hover:bg-gray-100 cursor-pointer transition-all duration-150 rounded-lg"
                onMouseDown={() => handleProfileClick(user.userId)} // Use onMouseDown to prevent losing focus
              >
                <Avatar>
                  <AvatarImage src={user.userImage} />
                  <AvatarFallback>
                    {user.firstName.charAt(0)}
                    {user.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="font-semibold text-gray-800">{`${user.firstName} ${user.lastName}`}</p>
                  <p className="text-xs text-gray-500">View Profile</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading State */}
        {isSearching && (
          <p className="absolute top-full left-0 mt-1 p-2 text-sm text-gray-500">Searching users...</p>
        )}
      </div>

      <div className="flex items-center space-x-4 px-6">
        <Link href="/" className={`icon hidden sm:flex ${pathname === "/" ? "active" : ""}`}>
          <HomeIcon className="h-5" />
          <p>Home</p>
        </Link>

        <Link href="/network" className={`icon hidden sm:flex ${pathname === "/hidden" ? "active" : ""}`}>
          <UsersIcon className="h-5" />
          <p>Network</p>
        </Link>

        <button className="icon hidden sm:flex opacity-50 cursor-not-allowed" disabled>
          <Briefcase className="h-5" />
          <p>Jobs</p>
        </button>

        <button className="icon hidden sm:flex opacity-50 cursor-not-allowed" disabled>
          <MessagesSquare className="h-5" />
          <p>Messaging</p>
        </button>

        {/* User Button if signed in */}
        <SignedIn>
          <UserButton />
        </SignedIn>

        {/* Sign In Button if not signed in */}
        <SignedOut>
          <Button asChild variant="secondary">
            <SignInButton />
          </Button>
        </SignedOut>
      </div>

      {/* Bottom navigation for Mobile */}
      <div className="fixed bottom-0 left-0 w-full bg-white flex justify-around items-center p-3 border-t border-gray-300 sm:hidden">
        <Link href="/" className={`icon ${pathname === "/" ? "active" : ""}`}>
          <HomeIcon className="h-5" />
          <p className="text-xs">Home</p>
        </Link>

        <Link href="/network" className={`icon ${pathname === "/" ? "active" : ""}`}>
          <UsersIcon className="h-5" />
          <p className="text-xs">Network</p>
        </Link>

        <button className="icon opacity-50 cursor-not-allowed" disabled>
          <Briefcase className="h-5" />
          <p className="text-xs">Jobs</p>
        </button>

        <button className="icon opacity-50 cursor-not-allowed" disabled>
          <MessagesSquare className="h-5" />
          <p className="text-xs">Messaging</p>
        </button>
      </div>
    </div>
  )
}

export default Header