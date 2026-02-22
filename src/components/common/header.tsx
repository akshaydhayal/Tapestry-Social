'use client'

import { Button } from '@/components/common/button'
import { abbreviateWalletAddress } from '@/components/common/tools'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import {
  Check,
  Clipboard,
  Coins,
  Home,
  LogIn,
  LogOut,
  Menu,
  RefreshCw,
  User,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useCurrentWallet } from '../auth/hooks/use-current-wallet'
import { useGetProfiles } from '../auth/hooks/use-get-profiles'
import { CreateProfileContainer } from '../create-profile/create-profile-container'
import { DialectNotificationComponent } from '../notifications/dialect-notifications-component'
import { useProfileStore } from '@/store/profile'

export function Header() {
  const { walletAddress } = useCurrentWallet()
  const { mainUsername, profileImage, setProfileData } = useProfileStore()
  const [isProfileCreated, setIsProfileCreated] = useState<boolean>(false)
  const [profileUsername, setProfileUsername] = useState<string | null>(null)
  const { profiles } = useGetProfiles({
    walletAddress: walletAddress || '',
  })
  const { connected, disconnect } = useWallet()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const dropdownRef = useRef(null)
  const router = useRouter()

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        (dropdownRef.current as HTMLElement).contains(event.target as Node)
      ) {
        return
      }
      setIsDropdownOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (profiles && profiles.length) {
      setProfileData(profiles[0].profile.username, profiles[0].profile.image || null)
    }

    if (isProfileCreated && profileUsername) {
      setProfileData(profileUsername, null)
      setIsProfileCreated(false)
      setProfileUsername(null)
    }
  }, [profiles, isProfileCreated, profileUsername, setProfileData])

  return (
    <>
      <div className="border-b-1 border-muted flex items-center justify-center w-full p-3">
        <div className="max-w-6xl w-full flex items-center justify-between">
          <Link 
            href="/" 
            className="hover:opacity-80"
          >
            <h1 className="text-2xl font-bold">Tapestry Reddit</h1>
          </Link>

          <nav className="flex items-center space-x-8">
            <Link
              href="/"
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <Home className="h-4 w-4 mr-2" />
              <span>Global Feed</span>
            </Link>

            <Link
              href="/subnets"
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              <span>Subnets</span>
            </Link>

            <div className="flex items-center space-x-4">
              {/* Only show profile stuff when the wallet is connected */}
              {connected && (
                mainUsername ? (
                  <Button
                    variant="ghost"
                    onClick={() => router.push(`/${mainUsername}`)}
                    className="space-x-2"
                  >
                    {profileImage ? (
                      <Image
                        src={profileImage}
                        width={24}
                        height={24}
                        alt="avatar"
                        className="object-cover rounded-full"
                        unoptimized
                      />
                    ) : (
                      <User size={16} />
                    )}
                    <p className="truncate font-bold">{mainUsername}</p>
                  </Button>
                ) : (
                  <CreateProfileContainer
                    setIsProfileCreated={setIsProfileCreated}
                    setProfileUsername={setProfileUsername}
                  />
                )
              )}

              {/* Always render the Solana Wallet Adapter native button */}
              <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 transition-colors auto-min-w !rounded-lg" />
            </div>

            <div className="flex items-center gap-2">
              <DialectNotificationComponent />
            </div>
          </nav>
        </div>
      </div>
    </>
  )
}
