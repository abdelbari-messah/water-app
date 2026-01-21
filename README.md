# 💧 WaterWise - Daily Water Intake Tracker
Stay hydrated, stay healthy with WaterWise! A beautiful, intuitive mobile application designed to help you track your daily water intake and build healthy hydration habits.
## 📱 About
WaterWise is a cross-platform mobile application built with [Expo](https://expo.dev) that helps users maintain optimal hydration levels throughout the day. With its clean interface, smart reminders, and comprehensive tracking features, staying hydrated has never been easier!
## ✨ Features
- 🎯 **Smart Hydration Tracking** - Real-time progress with beautiful circular indicators
- ⚙️ **Personalized Goals** - Weight-based calculations (30ml per kg) or custom targets
- 🔥 **Streak Tracking** - Build and maintain daily hydration streaks
- 📊 **Complete History** - Track all past intake with weekly averages
- ⏰ **Smart Reminders** - Customizable intervals (1h, 2h, 3h)
- 🎨 **Beautiful Design** - Light & Dark themes with smooth animations
- 🔒 **Privacy First** - 100% offline, all data stays on your device
## 🚀 Get started
1. Install dependencies
   ```bash
   npm install
   ```
2. Start the app
   ```bash
   npx expo start
   ```
In the output, you'll find options to open the app in a
- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo
You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).
## 🛠️ Tech Stack
- **React Native** (0.81.5) - Cross-platform mobile framework
- **Expo SDK** (~54.0) - Development platform and tooling
- **TypeScript** (5.9.2) - Type-safe JavaScript
- **Expo Router** (~6.0) - File-based routing system
- **React Native Reanimated** (~4.1) - High-performance animations
- **AsyncStorage** - Local data persistence
## 📂 Project Structure
```
app/
├── (tabs)/
│   ├── index.tsx      # Home screen (main tracker)
│   ├── history.tsx    # History & statistics
│   └── settings.tsx   # Settings & preferences
└── _layout.tsx        # Root layout
contexts/
└── ThemeContext.tsx   # Theme provider & management
```
## 🎯 How It Works
### Daily Tracking Flow
1. **Set Your Goal** - Configure based on weight or custom amount
2. **Log Your Intake** - Tap quick-add buttons or custom amounts
3. **Monitor Progress** - Watch your circular progress indicator fill up
4. **Build Streaks** - Consistently meet goals to build impressive streaks
5. **Review History** - Check past performance and weekly averages
### Weight-Based Goal Calculation
```
Daily Water Goal (ml) = Body Weight (kg) × 30ml
```
Example: 70kg person = 2,100ml daily goal
## 🏗️ Building for Production
### iOS Build
```bash
eas build --platform ios --profile production
```
### Android Build
```bash
eas build --platform android --profile production
```
## 📖 Learn more
To learn more about developing your project with Expo, look at the following resources:
- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.
## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.
## 📝 License
This project is licensed under the MIT License.
---
Made with ❤️ and React Native
