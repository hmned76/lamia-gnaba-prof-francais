# -*- coding: utf-8 -*-
"""Nettoie les doublons (fichiers " (1)", " (2)" ...) en verifiant le contenu."""
import os
import re
import hashlib
from collections import defaultdict

D = r"D:\lamia_gnaba_prof_francais\Non classé\Sameh_Ben_Amor"
SUFFIXE = re.compile(r' \(\d+\)(?=\.[^.]+$)')


def md5(p):
    h = hashlib.md5()
    with open(p, 'rb') as f:
        for bloc in iter(lambda: f.read(1 << 20), b''):
            h.update(bloc)
    return h.hexdigest()


fichiers = [f for f in os.listdir(D) if os.path.isfile(os.path.join(D, f))]
print("Fichiers presents :", len(fichiers))
print()

groupes = defaultdict(list)
for f in fichiers:
    groupes[SUFFIXE.sub('', f)].append(f)

supprimes = []
conserves = []

for base, lst in sorted(groupes.items()):
    if len(lst) == 1:
        conserves.append(lst[0])
        continue
    lst.sort(key=lambda x: (1 if SUFFIXE.search(x) else 0, x))
    garde = lst[0]
    try:
        hg = md5(os.path.join(D, garde))
    except Exception as e:
        print("ERREUR lecture", garde, e)
        conserves.extend(lst)
        continue
    for f in lst[1:]:
        p = os.path.join(D, f)
        try:
            if md5(p) == hg:
                os.remove(p)
                supprimes.append(f)
            else:
                print("! contenu DIFFERENT, conserve :", f)
                conserves.append(f)
        except Exception as e:
            print("ERREUR", f, e)
            conserves.append(f)
    conserves.append(garde)

print("=== DOUBLONS SUPPRIMES :", len(supprimes), "===")
for s in sorted(supprimes):
    print("   -", s)

print()
reste = [f for f in os.listdir(D) if os.path.isfile(os.path.join(D, f))]
print("=== FICHIERS UNIQUES RESTANTS :", len(reste), "===")

par_type = defaultdict(list)
for f in sorted(reste):
    ext = os.path.splitext(f)[1].lower() or "(sans extension)"
    par_type[ext].append(f)

for ext in sorted(par_type):
    print("  %-8s : %d" % (ext, len(par_type[ext])))

total = sum(os.path.getsize(os.path.join(D, f)) for f in reste)
print()
print("Taille totale : %.1f Mo" % (total / 1024 / 1024))
