# Ajout regles pare-feu entrantes pour LamiAI (port 8080) + OnlyOffice DS (port 80)
# A executer UNE SEULE FOIS en Administrateur
try {
  if (-not (Get-NetFirewallRule -DisplayName "LamiAI Serveur 8080" -ErrorAction SilentlyContinue)) {
    New-NetFirewallRule -DisplayName "LamiAI Serveur 8080" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 8080 -Profile Any | Out-Null
    Write-Host "Regle 8080 creee (tous profils)"
  } else { Write-Host "Regle 8080 deja presente" }
  if (-not (Get-NetFirewallRule -DisplayName "OnlyOffice DS 80" -ErrorAction SilentlyContinue)) {
    New-NetFirewallRule -DisplayName "OnlyOffice DS 80" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 80 -Profile Any | Out-Null
    Write-Host "Regle 80 creee (tous profils)"
  } else { Write-Host "Regle 80 deja presente" }
  Write-Host "OK - pare-feu pret pour le 2eme PC"
  Start-Sleep -Seconds 2
} catch {
  Write-Host "ERREUR: $($_.Exception.Message)"
  Start-Sleep -Seconds 5
}