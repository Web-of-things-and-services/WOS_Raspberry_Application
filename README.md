# WOS_Raspberry_Application

Ce projet contient le code d'un client devant tourner sur une Raspberry Pi 3 et 
permettant de se connecter à un puissance 4 en réseau. Le projet a été développé par un groupe d'étudiants
lors d'un cours sur les objets connectés à l'INSA Rouen Normandie.

Le reste du code 

# Installation

```
npm install
```

# Lancement du projet 

Lancer le client avec un redémarrage automatique à chaque changement (nodemon)
```
npm run start
```
ou
```
nodemon app.js
```

Lancer le client sans redémarrage automatique
```
node app.js
```

# Utilisation

En cas d'erreur de connexion au server hébergeant la partie, la raspberry affichera un message indiquant "Erreur de connexion".

Une fois la raspberry connecté, une LED en haut à droite permettra de savoir si une partie est actuellement en cours (vert) ou non (rouge).

Quand c'est à la raspberry de jouer, la première ligne des LEDs s'illumine. Le point bleu correspond à la position où la raspberry souhaite jouer,
on peut déplacer cette position à l'aide du joystick en faisant des mouvements horizontaux. Pour valider le coup à jouer,
il faut appuyer sur le joystick.

Le reste de la partie est entièrement automatique, des messages apparaissent sur la Raspberry pour indiquer son avancement !
