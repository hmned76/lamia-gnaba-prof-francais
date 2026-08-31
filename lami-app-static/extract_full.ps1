Add-Type -AssemblyName System.IO.Compression.FileSystem
$base = "D:\lamia_gnaba_prof_francais"
$allFiles = Get-ChildItem $base -Recurse -File -Include *.docx,*.doc | Where-Object { $_.Name -notmatch '^~\$' } | Sort-Object Name -Unique

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

function Extract-Doc([string]$path) {
    try {
        $bytes = [System.IO.File]::ReadAllBytes($path)
        $text = [System.Text.Encoding]::GetEncoding(1252).GetString($bytes)
        $textMatches = [regex]::Matches($text, '[^\x00-\x08\x0B\x0C\x0E-\x1F]{4,}')
        $result = ($textMatches | ForEach-Object { $_.Value }) -join ' '
        $result = [regex]::Replace($result, '\s+', ' ').Trim()
        return $result
    } catch {}
    return ''
}

$jsonEntries = @()
foreach ($d in $allFiles) {
    $content = ""
    if ($d.Extension -eq '.docx') {
        $content = Extract-Docx $d.FullName
    } elseif ($d.Extension -eq '.doc') {
        $content = Extract-Doc $d.FullName
    }
    
    if (-not $content) { $content = "Document - contenu non extractible" }
    $content = $content -replace '\\','\\\\' -replace '"','\\"' -replace "'","\\'" -replace "`r",' ' -replace "`n",' ' -replace "`t",' '
    
    $name = $d.Name -replace '\\','\\\\' -replace '"','\\"' -replace "'","\\'"
    
    $sizeKB = [math]::Round($d.Length/1024)
    $ext = $d.Extension.TrimStart('.').ToUpper()
    
    $jsonEntries += "  {name:`"$name`",content:`"$content`",ext:`"$ext`",size:`"$sizeKB KB`",path:`"$($d.FullName -replace '\\','\\\\')`"}"
    
    Write-Output "Extracted: $($d.Name) - $($content.Length) chars"
}

$jsonFile = "[" + [Environment]::NewLine + ($jsonEntries -join "," + [Environment]::NewLine) + [Environment]::NewLine + "]"
$jsonFile | Out-File "D:\lamia_gnaba_prof_francais\lami-app-static\doc_contents_full.json" -Encoding utf8
Write-Output "`nDONE: $($jsonEntries.Count) files extracted to doc_contents_full.json"
