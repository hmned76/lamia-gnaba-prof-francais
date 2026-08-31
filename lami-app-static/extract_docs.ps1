Add-Type -AssemblyName System.IO.Compression.FileSystem

$base = "D:\lamia_gnaba_prof_francais"
$docs = Get-ChildItem $base -Recurse -File -Include *.docx | Where-Object { $_.Name -notmatch '^~\$' }

function Get-Level($fullPath, $name) {
    $p = $fullPath.ToLower(); $n = $name.ToLower()
    if ($p -match '1ère ann') { return '1ère Année' }
    if ($n -match '1ère|1s10|1s11') { return '1ère Année' }
    if ($n -match 'test dia|test diagnostique|évaluation') { return '1ère Année' }
    if ($p -match 'bac module 3|doc bac') { return '3ème Année Lettres' }
    if ($n -match 'bac.*lettres|bac l\.|bac-blanc|bac blanc|bac économique|bac technique') { return '3ème Année Lettres' }
    if ($n -match 'poésie|poesie|barbara|dissertation|tonalité|tonalités|versification') { return '3ème Année Lettres' }
    if ($n -match 'modernité|moderne|conformisme|raison|lumière|engagement|partage') { return '3ème Année Lettres' }
    if ($n -match 'nominalisation|concordance.*bac|épreuve bac|BATRANU') { return '3ème Année Lettres' }
    if ($n -match 'dev bac|devoir bac|bac$|module 5|module 3|Que les poètes|texte bac blanc') { return '3ème Année Lettres' }
    if ($n -match 'francais|mireille|text00|francais|Mémoires|biographie|Module poésie|comment argumenter') { return '3ème Année Lettres' }
    if ($n -match 'bac sc|bac sciences|bas scientifiques|bas sc') { return '3ème Année Sciences' }
    if ($p -match '4ème module') { return '4ème Année Lettres' }
    if ($n -match '4ème|4e l|4è|subordination|discours|Module I|page de garde|lecture|bibliothèque|fiche de lecture') { return '4ème Année Lettres' }
    if ($n -match 'dev 1s11|devoir 1s10|dev 4ème|dev-cont1-4è|Module 4|fiche gram|fiche pédagogique|texte.*mod|expression 4ém|Essai|Revision|vocabulaire-4ème|demain') { return '4ème Année Lettres' }
    if ($n -match '4ème.*sciences|2ème sc') { return '4ème Année Sciences' }
    if ($p -match '2ème année') { return '2ème Année' }
    if ($n -match '2ème|2e |2Lettres|femme|société|societe|conditionnel|grammaire|figure|cause|rapport|type.*phrase|expression|compréhension|vocabulaire|vocab|synthèse|synthese|synt|exercice|pollution|environnement|dev syn|dev 2ème|dev cont|dev mod|devoir|DC|repartion|répartition|etude|étude|révision|hamdi|évasion|Elle met|épreuve|Fiche|image|conjugaison|concordance') { return '2ème Année' }
    return 'Non classé'
}

function Get-Cat($name) {
    $n = $name.ToLower()
    if ($n -match 'devoir|dev |dc|contrôle|controle') { return 'controle' }
    if ($n -match 'fiche') { return 'fiche' }
    if ($n -match 'exercice|excercice') { return 'exercice' }
    if ($n -match 'synthèse|synthese|synt') { return 'synthese' }
    if ($n -match 'vocabulaire|vocab') { return 'vocabulaire' }
    if ($n -match 'révision|revision') { return 'revision' }
    if ($n -match 'test|diagnostique|évaluation') { return 'evaluation' }
    return 'cours'
}

function Extract-Docx([string]$path) {
    try {
        $zip = [System.IO.Compression.ZipFile]::OpenRead($path)
        $entry = $zip.Entries | Where-Object { $_.FullName -eq 'word/document.xml' }
        if ($entry) {
            $stream = $entry.Open()
            $reader = New-Object System.IO.StreamReader($stream)
            $xml = $reader.ReadToEnd()
            $textMatches = [regex]::Matches($xml, '<w:t[^>]*>([^<]+)</w:t>')
            $text = ($textMatches | ForEach-Object { $_.Groups[1].Value }) -join ' '
            $text = [regex]::Replace($text, '\s+', ' ').Trim()
            $zip.Dispose()
            return $text
        }
        $zip.Dispose()
    } catch {}
    return ''
}

$id = 1
$lines = @()
foreach ($d in $docs) {
    $level = Get-Level $d.FullName $d.Name
    $cat = Get-Cat $d.Name
    $size = "$([math]::Round($d.Length/1024)) KB"
    $content = Extract-Docx $d.FullName
    if ($content.Length -gt 500) { $content = $content.Substring(0, 500) + '...' }
    if (-not $content) { $content = "Document DOCX - $level" }
    $content = $content -replace "'"," " -replace "\\"," " -replace "`r"," " -replace "`n"," "
    $name = $d.Name -replace "'"," " -replace "\\"," "
    $lines += "  {id:$id,name:'$name',type:'DOCX',level:'$level',mod:'Général',date:'2025',size:'$size',cat:'$cat',content:'$content'}"
    $id++
}

$jsArray = "const DOCS = [" + ([char]10) + ($lines -join "," + [char]10) + [char]10 + "];"
$jsArray | Out-File "D:\lamia_gnaba_prof_francais\lami-app-static\docs_content.js" -Encoding utf8
Write-Output "OK $($lines.Count) documents DOCX avec contenu reel extraits"
