# Putt-master-9000-server

Welcome to the Putt-master-9000-server repository! This is the backend server for the FuDisc App,
a comprehensive disc golf scorekeeping application.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## Introduction

The Putt-master-9000-server is designed to handle all backend operations for the FuDisc App. It provides a robust and scalable API to manage user data, game statistics, and other essential functionalities.

The FuDisc App is a disc golf scorekeeping app that helps players track their scores, manage games, and view leaderboards. You can find the app in the following locations:
- GitHub Repository: [putt-master-9000](https://github.com/Henzii/putt-master-9000)
- Google Play Store: [FuDisc App](https://play.google.com/store/apps/details?id=com.henzisoft.puttmaster9000)

## Features

- User authentication and authorization
- Game statistics tracking
- Leaderboards and rankings
- Course management
- Real-time updates

## Installation

To get started with the Putt-master-9000-server, follow these steps:

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/Putt-master-9000-server.git
    ```
2. Navigate to the project directory:
    ```sh
    cd Putt-master-9000-server
    ```
3. Install the dependencies:
    ```sh
    npm install
    ```
4. Set up the environment variables. Create a `.env` file in the root directory and add at least the following:
    ```env
    MONGO_URI=your_database_url
    TOKEN_KEY=key used to encrypt auth tokens
    ```
5. Other optional .env variables are
    ```env
    PUSH_ACCESS_TOKEN=token_for_sending_push_messages
    MONGO_URI_DEV=optional_dev_database_url
    ```

## Usage

To start the server, run:
```sh
npm start
```

