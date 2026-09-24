LamiAI - LOGICIEL WINDOWS (2eme PC)
====================================

Ce dossier contient la version ordinateur de LamiAI, identique a
l'APK du telephone : une VRAIE application installee sur le PC.

Les 3 appareils se connectent ensemble a la MEME base :
  - PC de la Prof (le serveur)
  - 2eme PC (ce logiciel)
  - Telephone / APK

------------------------------------------------
 CHOISIS TON FICHIER
------------------------------------------------
1) "LamiAI Setup 1.0.0.exe"   -> INSTALLATEUR (recommandé)
   Installe LamiAI comme un vrai logiciel (menu Demarrer + Bureau).
   Double-clic -> Suivant -> installer -> Terminer.

2) "LamiAI 1.0.0.exe"         -> PORTABLE (optionnel)
   Pas d'installation : double-clic et ca tourne. Utile pour
   essayer sans rien installer.

------------------------------------------------
 CE QUE LE LOGICIEL FAIT
------------------------------------------------
- A l'ouverture, il cherche le serveur de la Prof :
     * d'abord le WIFI local  (192.168.100.29:8080)
     * ensuite via Tailscale  (100.104.240.32:8080)
- Il ouvre LamiAI dans sa propre fenetre (comme une application).
- Meme base, meme bibliotheque, meme emploi, meme releve, meme travail.

------------------------------------------------
 CONNEXION PARTOUT (HORS MAISON) - UNE SEULE FOIS
------------------------------------------------
Le logiciel fonctionne deja a la maison (wifi local).
Pour l'utiliser N'IMPORTE OU (ecole, 4G...), il faut installer
Tailscale sur CE PC (2 min) :
  1) https://tailscale.com/download
  2) Installer puis se connecter avec le MEME compte que le PC de la Prof
  3) Redemarrer LamiAI -> il trouvera le serveur automatiquement.

------------------------------------------------
 SI LE LOGICIEL AFFICHE "n'est pas joignable"
------------------------------------------------
Verifie que :
  - le PC de la Prof est ALLUME (c'est lui le serveur)
  - si tu es hors de la maison : Tailscale est connecte
  Clique sur "Reessayer" apres la correction.