$base = "https://hongminzhao80-eng.github.io/ai-content-workbench-site"
$body = '{"submission_id":"web_test123","lead_type":"trial","organization_name":"测试机构","contact_name":"张三","mobile":"13800138000"}'
Write-Output "=== POST /api/v1/leads ==="
try {
  $r = Invoke-WebRequest -Uri ($base + "/api/v1/leads") -Method POST -ContentType "application/json" -Body $body -UseBasicParsing -TimeoutSec 25
  Write-Output ("status: " + $r.StatusCode)
} catch {
  $resp = $_.Exception.Response
  if ($resp) { Write-Output ("HTTP error: " + [int]$resp.StatusCode + " " + $resp.StatusDescription) }
  else { Write-Output ("Network error: " + $_.Exception.Message) }
}

Write-Output "=== POST /api/v1/partners ==="
try {
  $r2 = Invoke-WebRequest -Uri ($base + "/api/v1/partners") -Method POST -ContentType "application/json" -Body $body -UseBasicParsing -TimeoutSec 25
  Write-Output ("status: " + $r2.StatusCode)
} catch {
  $resp2 = $_.Exception.Response
  if ($resp2) { Write-Output ("HTTP error: " + [int]$resp2.StatusCode + " " + $resp2.StatusDescription) }
  else { Write-Output ("Network error: " + $_.Exception.Message) }
}