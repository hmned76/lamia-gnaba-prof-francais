' demarre la colonne GitHub SANS fenetre visible
Set sh = CreateObject("WScript.Shell")
sh.CurrentDirectory = "D:\lamia_gnaba_prof_francais"
sh.Run "cmd /c sync-pc.bat", 0, False
