# [3Bot Deployer](https://library.threefold.me/info/sdk/#/sdk__3bot_deployer)

## Table of contents

- How to install [MetaMask Extension | Chrome version](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn)
- How to deploy a solution using the [threefold flist](https://library.threefold.me/info/sdk/#/threefold__zos_fs?id=uses-flist-inside)
- How to clone and run this project locally

## How to install MetaMask Extension

You can install the MetaMask extension in Chrome by following these steps:

- Open your Chrome browser and navigate to the [Chrome Web Store](https://chrome.google.com/webstore/category/extensions)
- In the search bar, type "MetaMask" and hit Enter.
- Click on the "Add to Chrome" button next to the MetaMask extension.
- A pop-up window will appear asking you to confirm the installation. Click "Add Extension" to proceed.
- Wait for the extension to finish installing. Once it's done, you'll see the MetaMask fox icon in your browser toolbar.
- Click on the fox icon to open the MetaMask extension. Follow the prompts to set up your MetaMask account.
- Once your account is set up, you can use MetaMask to interact with Ethereum-based decentralized applications (dApps) and manage your cryptocurrency wallets.

That's it! You have successfully installed MetaMask extension in Chrome.

## How to deploy a solution using the threefold flist

To deploy a solution using the ThreeFold Flist, you can follow these general steps:

- Choose the application or solution you want to deploy: This could be a website, a database, a blockchain node, or any other type of application.

- Find the corresponding Flist for your application: You can browse the [ThreeFold Marketplace](https://hub.grid.tf/) to find the Flist for your application. Alternatively, you can create your own Flist if you have the necessary knowledge and expertise.

- Deploy the Flist on the ThreeFold Grid: You can deploy the Flist on the ThreeFold Grid using the [0-OS system](https://library.threefold.me/info/sdk/#/threefold__zos).

- Connect to the instance: Once the instance is up and running, you can connect to it using SSH or any other protocol that is supported by the application you deployed.

- Use the application: Finally, you can use the application as you would on any other server.

Note that these steps are general and may vary depending on the specific Flist and application you are deploying. Be sure to consult the documentation for the Flist and application you are using for more detailed instructions.


## How to clone and run this project locally

To clone and run the Threebot Deployer project locally, you can follow these steps:

- Install [Git](https://git-scm.com/downloads): If you haven't already, install [Git](https://git-scm.com/downloads) on your computer. You can download it from the official [Git website.](https://git-scm.com/downloads).

- Clone the project: Open a terminal or command prompt window and navigate to the directory where you want to clone the project. Then, run the following command to clone the project:

<!-- TODO, move the project from thunder to threefoldtech -->
```sh
git clone https://github.com/threefoldtech/threebot-deployer.git
```

This will download the project code and create a new directory named "threebot-deployer" in your current directory.

- Install dependencies: Navigate to the "threebot-deployer" directory and install the project dependencies by running the following command:

```sh
cd threebot-deployer && yarn
```

This will install all the required packages and libraries needed to run the project.

- Set up environment: The Threebot Deployer project requires several environment variables to be set up before it can be run. You can set these up by creating a new file named `config.js` in the `threebot-deployer/public` directory and adding the following lines to it:

```js
window.config = {
  // Choose which network you'll work against, available nets = [dev, qa, test, main]
  network: 'dev',
  projectNamePrefix: 'dep',
};
```

- Run the project: Once you have set up the environment variables, you can start the Threebot Deployer project by running the following command:

```sh
yarn dev
```

This will start the project and it should be accessible at <http://localhost:5173/> if the port is available to use.
