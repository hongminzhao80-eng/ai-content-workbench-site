
$cacheDir = "D:\网络营销\AI内容创作工作平台资料\官网建设\.test-cache"
$checks = @(
  @{ f = "solutions__healthcare.html"; w = "治疗建议" },
  @{ f = "terms.html"; w = "在线订阅" },
  @{ f = "terms.html"; w = "治疗建议" },
  @{ f = "index.html"; w = "治疗建议" }
)
foreach ($c in $checks) {
  $html = [System.IO.File]::ReadAllText((Join-Path $cacheDir $c.f), [System.Text.Encoding]::UTF8)
  Write-Output ("### " + $c.f + "  word=[" + $c.w + "]")
  $idx = $html.IndexOf($c.w)
  if ($idx -ge 0) {
    $start = [Math]::Max(0, $idx - 70)
    $len = [Math]::Min(200, $html.Length - $start)
    $seg = $html.Substring($start, $len)
    $clean = [regex]::Replace($seg, '<[^>]+>', ' ')
    $clean = [regex]::Replace($clean, '\s+', ' ')
    Write-Output ("  CONTEXT: " + $clean)
  }
  Write-Output ""
}
