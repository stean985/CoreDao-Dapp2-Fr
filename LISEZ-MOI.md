Pour tester cette application décentralisée, suivez les étapes ci-dessous :

1- git clone https://github.com/stean985/CoreDao-Dapp2-Fr.git
2- naviguer dans le dossier Backend : cd .\Backend
3- créer le fichier secret.json, et ajouter la ligne suivante :
{"PrivateKey":"votre clé privée, ne divulguez pas ce fichier, gardez-le en sécurité"}


4- installez hardhat et ses dépendances : npm install --save-dev hardhat
5- compilez les 3 smart contracts : npx hardhat compile
6- déployez les smart contracts : npx hardhat run .\scripts\deploy.js
la sortie devrait ressembler à 
Déploiement des contrats avec le compte : 0x5720ec329B00EAd34D2FBAf97c852231222efb0A
Contrats déployés :
Staking Token: 0x9373dd47cb1Dd094264279F6A912Da95e69a0e4F
Reward Token: 0xDfDf8a69042De6422E6B50A838DC26Bb57Ec7730
Staking Dapp: 0xBb9eD6A08C75a42354807Ab252CE28B812627CfE


7- naviguez dans le dossier Frontend : cd .\Frontend
8- installez les dépendances : npm install
9- testez localement avec : npm run start
