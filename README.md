# Getting Started with This Project

## Installing Stardog and Setting Up
You can get started by [installing Stardog based on your platform](https://docs.stardog.com/get-started/install-stardog/). 

## Cloning This Project
Use `git clone` to clone this project

## Loading Data
Create a database by starting Stardog server by using 
```
stardog-admin server start
```
after that, access your local Stardog Studio and create a database named `YugiohDB` and load `./src/data/data.ttl` to the aforementioned database

## Starting The Project
Install the dependencies
```
yarn install
```
Start Stardog server
```
stardog-admin server start
```
Start the React project
```
yarn start
```
