# Install Git on Windows - Quick Guide

## 🎯 What is Git?
Git is a version control system that helps you track changes in your code and upload it to GitHub.

## 📥 Installation Steps

### Method 1: Download Installer (Recommended)

1. **Download Git for Windows**
   - Visit: https://git-scm.com/download/win
   - Click "Click here to download" (64-bit version)
   - File size: ~50 MB

2. **Run the Installer**
   - Double-click the downloaded `.exe` file
   - Click "Next" through all the screens (default settings are fine)
   - Important screens:
     - ✅ "Select Components" → Keep defaults
     - ✅ "Choosing the default editor" → Select "Use Visual Studio Code" or "Nano"
     - ✅ "Adjusting your PATH" → Select "Git from the command line and also from 3rd-party software"
     - ✅ Click "Install"

3. **Verify Installation**
   - Open a NEW PowerShell window
   - Run:
   ```powershell
   git --version
   ```
   - You should see: `git version 2.x.x`

### Method 2: Using Winget (Windows Package Manager)

If you have Windows 11 or Windows 10 (recent version):

```powershell
# Run in PowerShell as Administrator
winget install --id Git.Git -e --source winget
```

## ⚙️ Configure Git (After Installation)

Open PowerShell and run:

```powershell
# Set your name
git config --global user.name "Your Name"

# Set your email (use the same email as your GitHub account)
git config --global user.email "your.email@example.com"

# Verify configuration
git config --list
```

## ✅ You're Ready!

Now you can use Git commands like:
- `git init` - Initialize a repository
- `git add .` - Stage all files
- `git commit -m "message"` - Commit changes
- `git push` - Upload to GitHub

## 🚀 Next Steps After Installing Git

1. Create a GitHub account (if you don't have one): https://github.com/signup
2. Come back to your project folder
3. Follow the deployment steps

---

## 🆘 Troubleshooting

### Issue: "git: command not found" after installation
**Solution**: Close and reopen PowerShell (or restart your computer)

### Issue: Permission denied
**Solution**: Run PowerShell as Administrator

---

## 📝 Quick Reference

After Git is installed, here are the commands you'll use:

```powershell
# Navigate to your project folder
cd C:\Users\Adit\OneDrive\Desktop\Project_AWS_Hackathon

# Initialize Git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Connect to GitHub (after creating repo on GitHub.com)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to GitHub
git push -u origin main
```

That's it! Git installation takes about 5 minutes.
