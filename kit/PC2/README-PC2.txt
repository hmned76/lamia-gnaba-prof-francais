========================================================
 LamiAI - Le 2EME PC se connecte a la MEME base
 (PC de la Professeure = serveur : bibliotheque, emploi,
  relevé de notes, fichiers, assistant IA - tout est partage)
========================================================

Bonjour ! Ce PC vient de s'ajouter au systeme LamiAI.
Il n'installe RIEN sur ce PC : il se CONNECTE au serveur
qui tourne sur le PC principal (la Prof). C'est exactement
ce que fait deja le telephone (meme base, meme travail).

C'est meme travail = les 2 PC voient et modifient le MEME
contenu (aucune copie en double).

--------------------------------------------------------
 ETAPE 1 - Installer Tailscale (une seule fois, 3 min)
--------------------------------------------------------
1. Telecharger : https://tailscale.com/download
   (version Windows)
2. Installer (double-clic, par defaut c'est bon).
3. Ouvrir Tailscale et se CONNECTER :
   -> au point 3 il faut utiliser le MEME compte que le PC
      de la Prof (ex: le compte Google de la Prof) pour
      rejoindre le meme reseau prive. Sinon demander a la
      Prof de partager son reseau Tailscale avec vous.
4. Verifier que le point vert "Connect" est actif (ip 100.x).
   Le PC de la Prof est joignable a l'adresse : 100.104.240.32

--------------------------------------------------------
 ETAPE 2 - Ouvrir LamiAI (a chaque utilisation)
--------------------------------------------------------
- Double-clique sur "Ouvrir-LamiAI.bat" (dans ce dossier)
- L'application s'ouvre dans le navigateur, connectee a la
  MEME base que tous les autres appareils. C'est tout !

  Astuce : tu peux copier Ouvrir-LamiAI.bat sur le Bureau
  pour l'avoir sous la main (clic droit -> Envoyer vers -> Bureau).

--------------------------------------------------------
 SI CE PC EST AUSSI SUR LE MEME WIFI QUE LA PROF
--------------------------------------------------------
Tu peux aussi utiliser l'adresse locale (plus rapide) :
   http://192.168.100.29:8080
Mais l'option Tailscale (ci-dessus) fonctionne PARTOUT
(WiFi, ecole, 4G...) et reste celle recommandee.

--------------------------------------------------------
 REMARQUE IMPORTANTE
--------------------------------------------------------
- Le serveur (PC de la Prof) doit etre ALLUME pour que ce PC
  se connecte. L'app est enregistree automatiquement sur le
  PC principal (travail sauvegarde la-bas).
- Si le PC principal est ETEINT, le mode hors-ligne total
  (Phase D) arrivera plus tard : chaque PC pourra travailler
  et tout se resynchronisera automatiquement.