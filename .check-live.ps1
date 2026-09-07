$u = 'https://hongminzhao80-eng.github.io/ai-content-workbench-site/trial/?t=' + [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
try {
  $r = Invoke-WebRequest -Uri $u -UseBasicParsing -TimeoutSec 30
  $m = [regex]::Match($r.Content, 'id=.app-config.>([^<]+)<')
  if ($m.Success) { Write-Output ('live app-config: ' + $m.Groups[1].Value.Substring(0, 400)) }
  else { Write-Output 'app-config not found in live page' }
} catch { Write-Output ('ERR ' + $_.Exception.Message) }