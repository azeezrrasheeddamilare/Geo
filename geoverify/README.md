# 🌍 GeoVerify Nigeria - Location-Validated NFTs on Solana

<div align="center">
  <img src="https://img.shields.io/badge/Solana-9945FF?style=for-the-badge&logo=solana&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/Nigeria-008753?style=for-the-badge&logo=nigeria&logoColor=white" />
</div>

<p align="center">
  <strong>The first platform that mints NFTs only when you're physically present at Nigerian locations</strong>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-use-cases-for-nigeria">Use Cases</a> •
  <a href="#-how-it-works">How It Works</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-api-reference">API</a> •
  <a href="#-grant-application">Grant</a>
</p>

---

## 📋 Table of Contents
- [Problem](#-problem)
- [Solution](#-solution)
- [Features](#-features)
- [Use Cases for Nigeria](#-use-cases-for-nigeria)
- [How It Works](#-how-it-works)
- [Tech Stack](#-tech-stack)
- [Why Solana](#-why-solana)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Screenshots](#-screenshots)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [Team](#-team)
- [Grant Application](#-grant-application)
- [License](#-license)
- [Contact](#-contact)

---

## ❗ Problem

Nigeria loses **₦50 billion+ annually** to preventable fraud:

| Sector | Problem | Annual Loss |
|--------|---------|-------------|
| 🎫 **Events** | Fake tickets, scalping, false attendance claims | ₦20B+ |
| 🎓 **Education** | 60% of certificates in circulation are fake | ₦15B+ |
| 🗺️ **Tourism** | No visitor tracking,无法奖励 loyal tourists | ₦5B+ |
| 💼 **Business** | Sales teams claim fake client visits | ₦7B+ |
| 🕋 **Religion** | Pilgrimage fraud, families can't verify | ₦3B+ |

### Why Current Solutions Fail

| Method | Problem |
|--------|---------|
| 📄 **Paper Certificates** | Can be easily copied, forged, or damaged |
| 💾 **Centralized Databases** | Can be hacked, manipulated, or deleted |
| 📍 **Basic GPS** | Can be spoofed with fake location apps |
| 📧 **Email Verification** | No proof of physical presence |
| 🏢 **Company Records** | Company can alter or deny them |

---

## ✅ Solution: GeoVerify Nigeria

We built the first platform that **mints NFTs ONLY when physically present** at a location.

```mermaid
graph TD
    A[User at Location] -->|Opens App| B[GPS Check]
    B --> C{Within Radius?}
    C -->|Yes| D[Generate ZK Proof]
    C -->|No| E[Access Denied]
    D --> F[Mint NFT on Solana]
    F --> G[Permanent Proof of Attendance]
    G --> H[Share on Social Media]
    G --> I[Verify with Employers]
    G --> J[Get Discounts/Rewards]
