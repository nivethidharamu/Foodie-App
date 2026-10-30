# Foodie App

A React Native + Expo recipe discovery app built for the application review checklist.

## Features
- 10 horizontally displayed recipe categories plus My Food
- Recipe detail screen: ingredients, instructions, preparation time, servings, calories and difficulty
- Favorite/unfavorite toggle and Favorites screen
- My Food / My Recipes with Add New Recipe
- Add recipes with image selection, ingredients and step-by-step instructions
- Edit and delete user-created recipes
- Persistent recipe storage using AsyncStorage
- Back navigation using the on-screen back control and Android hardware back button

## Run locally
1. Install Node.js.
2. In this folder, run `npm install`.
3. Run `npx expo start`.
4. Scan the QR code with Expo Go.

## Import into Snack
Create a public GitHub repository, upload `App.js` and `package.json`, then use Snack Expo's **Import Git Repository** option with the public repository URL. Snack may ask you to add the listed dependencies.

## Notes
- The starter app includes sample recipes.
- Images are loaded from remote Unsplash image URLs; user-added images are selected from the device.
- Recipe data is saved locally on the device/browser environment. It is not a cloud-synced database.
