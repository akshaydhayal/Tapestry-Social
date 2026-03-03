# Tapestry Social: On-Chain Community Platform

Live Project Link: [https://tapestry-social.vercel.app/](https://tapestry-social.vercel.app/)

Tapestry Social is a fully-featured decentralized social platform built on Solana, powered by the **Tapestry Protocol**. It enables users to build vibrant communities, share content dynamically, and manage on-chain identities with a strong focus on reputation and gated access.

## ✨ Key Features & Architecture

### 1. **Persistent & Expansive UI**
- **Modern 3-Column Layout**: A full-width, expansive design with ultra-high contrast visual separation (`#3f3f46` borders) maximizing readability.
- **Persistent Sidebars**: Left and right sidebars remain consistently mounted across page transitions for zero-reload navigation, providing a fluid, native app-like experience.
- **Optimized Performance**: Built with Next.js App Router for blazing-fast load times.
- **Responsive Design**: Carefully crated mobile and desktop unified views.

![Layout UI Placeholder](https://github.com/akshaydhayal/Tapestry-Social/blob/main/demo/feed.png)

### 2. **Rich Content & Subnets**
- **Integrated Feed**: Users can seamlessly read and write posts across different communities.
- **Markdown & Image Support**: Posts fully support rich text, image attachments, and embeds.
- **Community Subnets Categories**: Posts are automatically categorized into community-specific subnets. Metadata allows subnets to filter global feeds.
- **CRUD Operations**: Users can seamlessly edit and delete posts dynamically.

![Feed Placeholder](https://github.com/akshaydhayal/Tapestry-Social/blob/main/demo/discover.png)
![Feed Placeholder](https://github.com/akshaydhayal/Tapestry-Social/blob/main/demo/communtiy_page.png)

### 3. **Decentralized Identity & Profiles**
- **Solana Wallet Integration**: Full support for Solana wallets via Privy/Standard Adapters.
- **Customizable Profiles**: Set up custom bio, avatar, and banner with integrated Tapestry protocol API routes.
- **Reputation-Centric Profiles**: Profiles prominently display decentralized reputation (FairScore), total followers, and joined subnets.
- **User Following Strategy**: On-chain user relationships leveraging Tapestry Social Graph.

![Profile UI Placeholder](https://github.com/akshaydhayal/Tapestry-Social/blob/main/demo/profile.png)
![Profile UI Placeholder](https://github.com/akshaydhayal/Tapestry-Social/blob/main/demo/create-profile.png)


### 4. **Gated Communities & FairScore Ecosystem**
Create and join niche communities that are gated natively by on-chain reputation logic.
- **Dynamic Group Creation**: Any user can launch a new subnet assigning it properties like public vs private.
- **FairScore Integration**: Access to posts and groups can be gated by verifiable reputation score (using FairScore). This filters for high-quality members.
- **Configurable Restrictions**: Community leads can set and update reputation requirements (e.g., "Fairscore > 200 required to join/post").
- **UI Enforcements**: Beautifully integrated lock screens, gated badges, and conditional feed rendering based on users' real-time score.

![Gated Communities Placeholder](https://github.com/akshaydhayal/Tapestry-Social/blob/main/demo/gated.png)

### 5. **On-Chain Social Graph Base**
Powered by Tapestry, every follow, post, modification, and community interaction is recorded on the social graph securely. Data ownership and interoperability are globally guaranteed across the Solana ecosystem.


## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 18)
- **Blockchain**: [Solana](https://solana.com/)
- **Protocol**: [Tapestry](https://usetapestry.dev/) API
- **Styling**: Vanilla CSS + [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: Radix UI + Custom Glassmorphism
- **Auth & Wallets**: [Privy](https://privy.io/) / Wallet-based
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+
- pnpm or npm

### 2. Installation
```bash
git clone https://github.com/Primitives-xyz/solana-starter-kit # original starter
cd gated-subnets-app
pnpm install
```

### 3. Configuration
Rename `.env.example` to `.env.local` and add your keys:
```bash
NEXT_PUBLIC_HELIUS_API_KEY=your_key
NEXT_PUBLIC_PRIVY_APP_ID=your_key
```

### 4. Run Development Server
```bash
pnpm run dev
```
Navigate to `http://localhost:3000` to start exploring.

## 📜 Contributing
Contributions are welcome! Please feel free to submit issues or pull requests to help improve the Tapestry ecosystem.

## ⚖️ License
This project is licensed under the MIT License.
