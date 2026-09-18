' demarre le garde-fou SANS fenetre visible (impossible a fermer par erreur)
Set sh = CreateObject("WScript.Shell")
sh.CurrentDirectory = "D:\lamia_gnaba_prof_francais"
sh.Run "cmd /c serveur-guardien.bat", 0, False
